from datetime import datetime, timedelta
from typing import Iterable, List, Optional, cast
from flask import abort, current_app

from sqlalchemy import select
from db import flask_session
from models.buyer_model import Buyer
from models.deal_model import Deal
from models.dealer_model import Dealer
from models.ownership_model import Ownership
from models.transaction_model import Transaction
from utils.profits_utils import profit_for_buyer


def current_open_deals(max_share_price: Optional[float] = None) -> Iterable[Deal]:
    filters = [Deal.start_time >= datetime.now()]
    if max_share_price is not None:
        filters.append(Deal.share_price <= max_share_price)
    for deal in flask_session.scalars(select(Deal).filter_by(closed=False).where(*filters)):
        yield deal


def get_deal_by_serial_id(serial_id: int) -> Optional[Deal]:
    return flask_session.get(Deal, serial_id)


def patch_deal_open_asset_price(serial_id: int, open_asset_price: float) -> Deal:
    if open_asset_price <= 0:
        abort(400, f"Open asset price must be positive")
    deal = flask_session.get(Deal, serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {serial_id} not found")
    deal.open_asset_price = open_asset_price
    flask_session.commit()
    return deal


def create_deal(
    dealer_name: str,
    collection_id: str,
    asset_id: Optional[str],
    share_price: float,
    allowed_rates: List[float],
    initial_number_of_shares: int,
    start_time: datetime,
    end_time: datetime,
    multiplier: float,
) -> Deal:
    if not allowed_rates:
        abort(400, "You must specify non-empty list of allowed rates")
    maximum_allowed_rate: float = current_app.config["MAXIMUM_ALLOWED_RATE"]
    for rate in allowed_rates:
        if rate <= 0 or rate > maximum_allowed_rate:
            abort(400, f"The rate {rate} does not fall within the range of (0, {maximum_allowed_rate}]")
    if share_price <= 0:
        abort(400, "Share price must be positive")
    if initial_number_of_shares <= 0:
        abort(400, "Initial number of shares must be positive")
    min_start_time_delay: timedelta = current_app.config["MIN_START_TIME_DELAY"]
    if start_time < datetime.now() + min_start_time_delay:
        abort(400, f"start_time should be at least {datetime.now() + min_start_time_delay}")
    min_end_time_delay_from_start_time: timedelta = current_app.config["MIN_END_TIME_DELAY_FROM_START_TIME"]
    if end_time < start_time + min_end_time_delay_from_start_time:
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
    amount_needed = (1 + max(allowed_rates)) * share_price * initial_number_of_shares
    if dealer.lockup_balance + amount_needed >= dealer.balance:
        abort(
            409,
            f"Issuing these shares require a balance of {dealer.lockup_balance + amount_needed}, but the dealer only has {dealer.balance}",
        )
    dealer.lockup_balance = Dealer.lockup_balance + amount_needed
    new_deal = Deal(
        dealer_name=dealer_name,
        collection_id=collection_id,
        asset_id=asset_id,
        share_price=share_price,
        allowed_rates=allowed_rates,
        shares_remaining=initial_number_of_shares,
        start_time=start_time,
        end_time=end_time,
        lockup_balance=amount_needed,
        closed=False,
        multiplier=multiplier,
    )
    flask_session.add(new_deal)
    flask_session.commit()
    return new_deal


def find_closeable_deal_serial_ids() -> List[int]:
    """Find all the serial IDs of deals that ought to be closed but haven't."""
    statement = select(Deal.serial_id).where(Deal.end_time < datetime.now(), ~Deal.closed)
    return flask_session.scalars(statement).all()


def close_deal(serial_id: int) -> None:
    """Close a deal."""
    deal: Deal = flask_session.get(Deal, serial_id, with_for_update={"key_share": True})
    if deal is None:
        abort(404, f"Deal {serial_id} does not exist")
    if deal.closed:
        abort(409, f"Deal {serial_id} is already closed")
    if deal.end_time > datetime.now():
        abort(409, f"Deal {serial_id} has an end time {deal.end_time} which has not passed yet")
    if deal.start_time < datetime.now() and deal.open_asset_price is None:
        abort(500, f"Deal {serial_id} has started but does not have an open asset price, need attention")
    dealer: Dealer = flask_session.get(Dealer, deal.dealer_name, with_for_update={"key_share": True})
    if not dealer:
        abort(404, f"Dealer {deal.dealer_name} not found")
    deal.closed_asset_price = 1.0  # TODO get the correct closed asset price
    deal.closed = True
    for ownership in flask_session.scalars(
        select(Ownership)
        .where(Ownership.deal_serial_id == serial_id, Ownership.shares != 0)
        .with_for_update(key_share=True)
    ):
        typed_ownership = cast(Ownership, ownership)
        transaction = Transaction(
            buyer_name=typed_ownership.buyer_name,
            deal_serial_id=serial_id,
            shares=-typed_ownership.shares,
            rate=typed_ownership.rate,
            asset_price=deal.closed_asset_price,
        )
        flask_session.add(transaction)
        profit = profit_for_buyer(
            deal.open_asset_price,
            deal.closed_asset_price,
            deal.share_price,
            typed_ownership.rate,
            typed_ownership.shares,
            deal.multiplier,
        )
        buyer: Buyer = flask_session.get(Buyer, typed_ownership.buyer_name, with_for_update={"key_share": True})
        if not buyer:
            abort(404, f"Buyer {typed_ownership.buyer_name} not found")
        buyer.balance = Buyer.balance + typed_ownership.shares * deal.share_price + profit
        dealer.balance = Dealer.balance - profit
        typed_ownership.shares = 0
    dealer.lockup_balance = Dealer.lockup_balance - deal.lockup_balance
    flask_session.commit()
