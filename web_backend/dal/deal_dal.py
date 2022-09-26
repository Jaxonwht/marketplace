from typing import Any, Dict, Iterable, List, Optional
from datetime import datetime, timedelta
from flask import abort, current_app
from sqlalchemy import select

from db import flask_session
from dal.ownership_dal import prepare_ownerships_for_deal_before_close
from models.buyer_model import Buyer
from models.deal_model import Deal
from models.dealer_model import Dealer
from models.ownership_model import Ownership
from models.transaction_model import Transaction
from utils.profits_utils import profit_for_buyer
import nft_utils.deal_info as deal_info
from utils.json_utils import get_not_none


def get_deals(
    max_share_price: Optional[float] = None, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None
) -> Iterable[Deal]:
    filters = []
    if max_share_price is not None:
        filters.append(Deal.share_price <= max_share_price)
    if start_time is not None:
        filters.append(Deal.start_time >= start_time)
    if end_time is not None:
        filters.append(Deal.end_time <= end_time)
    for deal in flask_session.scalars(select(Deal).where(*filters)):
        yield deal


def get_deal_by_serial_id(serial_id: int) -> Optional[Deal]:
    return flask_session.get(Deal, serial_id)


def create_deal(
    dealer_name: str,
    collection_id: str,
    asset_id: Optional[str],
    is_nft_index: bool,
    share_price: float,
    rate: float,
    initial_number_of_shares: int,
    start_time: datetime,
    end_time: datetime,
    multiplier: float,
) -> Deal:
    maximum_allowed_rate: float = current_app.config["MAXIMUM_ALLOWED_RATE"]
    if rate <= 0 or rate > maximum_allowed_rate:
        abort(400, f"The rate {rate} does not fall within the range of (0, {maximum_allowed_rate}]")
    if share_price <= 0:
        abort(400, "Share price must be positive")
    if initial_number_of_shares <= 0:
        abort(400, "Initial number of shares must be positive")
    min_end_time_delay_from_start_time: timedelta = current_app.config["MIN_END_TIME_DELAY_FROM_START_TIME"]
    if end_time < start_time + min_end_time_delay_from_start_time or end_time < datetime.utcnow():
        abort(400, f"end_time should be at least {start_time + min_end_time_delay_from_start_time}")
    min_deal_multiplier = current_app.config["MIN_DEAL_MULTIPLIER"]
    max_deal_multiplier = current_app.config["MAX_DEAL_MULTIPLIER"]
    if multiplier < min_deal_multiplier or multiplier > max_deal_multiplier:
        abort(
            400, f"multiplier should be between {min_deal_multiplier} (inclusive) and {max_deal_multiplier} (inclusive)"
        )
    dealer = flask_session.get(Dealer, dealer_name, with_for_update={"key_share": True})
    if not dealer:
        abort(404, f"Dealer {dealer_name} not found")
    amount_needed = (1 + rate) * share_price * initial_number_of_shares
    if dealer.lockup_balance + amount_needed >= dealer.balance:
        abort(
            409,
            f"Issuing these shares require a balance of {dealer.lockup_balance + amount_needed}, but the dealer only has {dealer.balance}",
        )
    dealer.lockup_balance = Dealer.lockup_balance + amount_needed
    if collection_id is not None:
        info = deal_info.get_deal_info_with_ids(collection_id, asset_id)
        collection_name = get_not_none(info, "collection_name")
        #  if asset_id is not None:
        #  collection_name += asset_id
    else:
        # TODO Ziyi Add support for index
        # info = deal_info.get_info_index()
        collection_name = "dummy_index"
    extra_info: Dict[str, Any] = {}
    new_deal = Deal(
        dealer_name=dealer_name,
        collection_id=collection_id,
        asset_id=asset_id,
        is_nft_index=is_nft_index,
        share_price=share_price,
        rate=rate,
        shares_remaining=initial_number_of_shares,
        start_time=start_time,
        end_time=end_time,
        lockup_balance=amount_needed,
        closed=False,
        multiplier=multiplier,
        collection_name=collection_name,
        extra_info=extra_info,
    )
    flask_session.add(new_deal)
    flask_session.commit()
    return new_deal


def find_closeable_deal_serial_ids() -> List[int]:
    """Find all the serial IDs of deals that ought to be closed but haven't."""
    statement = select(Deal.serial_id).where(Deal.end_time < datetime.utcnow(), ~Deal.closed)
    return flask_session.scalars(statement).all()


def close_deal(serial_id: int, force: bool = False) -> None:
    """Close a deal."""
    deal: Deal = flask_session.get(Deal, serial_id, with_for_update={"key_share": True})
    if deal is None:
        abort(404, f"Deal {serial_id} does not exist")
    if deal.closed:
        abort(409, f"Deal {serial_id} is already closed")
    if deal.end_time > datetime.utcnow() and not force:
        abort(409, f"Deal {serial_id} has an end time {deal.end_time} which has not passed yet")
    dealer: Dealer = flask_session.get(Dealer, deal.dealer_name, with_for_update={"key_share": True})
    if not dealer:
        abort(404, f"Dealer {deal.dealer_name} not found")
    deal.closed_asset_price = deal_info.get_deal_current_price(deal)
    deal.closed = True
    for buyer_name, transaction_ids in prepare_ownerships_for_deal_before_close(deal.serial_id):
        buyer: Buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
        if not buyer:
            abort(404, f"Buyer {buyer_name} not found")
        shares_sold = 0
        total_profit = 0.0
        for transaction_id in transaction_ids:
            buy_transaction: Transaction = flask_session.get(Transaction, transaction_id)
            transaction = Transaction(
                buyer_name=buyer_name,
                deal_serial_id=serial_id,
                shares=-buy_transaction.shares,
                asset_price=deal.closed_asset_price,
            )
            flask_session.add(transaction)
            profit = profit_for_buyer(
                buy_transaction.asset_price,
                deal.closed_asset_price,
                deal.share_price,
                deal.rate,
                buy_transaction.shares,
                deal.multiplier,
            )
            total_profit += profit
            shares_sold += buy_transaction.shares
            ownership = flask_session.get(
                Ownership, (buyer_name, serial_id, transaction_id), with_for_update={"key_share": True}
            )
            ownership.closed = True
            flask_session.flush([transaction])
            ownership.close_transaction_serial_id = transaction.serial_id
        buyer.balance = Buyer.balance + shares_sold * deal.share_price + total_profit
        dealer.balance = Dealer.balance - total_profit
        deal.shares_remaining = Deal.shares_remaining + shares_sold
    dealer.lockup_balance = Dealer.lockup_balance - deal.lockup_balance
    flask_session.commit()
