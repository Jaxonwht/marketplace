from collections.abc import Iterable
from datetime import datetime
from typing import Optional
from flask import abort
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from db import flask_session
from models.buyer_model import Buyer
from models.deal_model import Deal
from models.dealer_model import Dealer
from models.ownership_model import Ownership

from models.transaction_model import Transaction
from utils.profits_utils import profit_for_buyer


def buy_shares(
    buyer_name: str,
    deal_serial_id: int,
    shares: int,
) -> Transaction:
    deal = flask_session.get(Deal, deal_serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {deal_serial_id} not found")
    if deal.closed:
        abort(409, f"Deal {deal_serial_id} is already closed")
    if datetime.now() > deal.start_time:
        abort(409, f"Deal {deal_serial_id} has started at {deal.start_time}")
    buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")

    user_balance = buyer.balance
    amount_needed = shares * deal.share_price
    if user_balance < amount_needed:
        abort(409, f"Buyer has {user_balance}, need at leart {amount_needed}")
    # Execute upsert for ownerships
    flask_session.execute(
        insert(Ownership)
        .values(buyer_name=buyer_name, deal_serial_id=deal_serial_id, shares=shares)
        .on_conflict_do_update(constraint="ownership_pkey", set_={"shares": Ownership.shares + shares})
    )
    transaction = Transaction(buyer_name=buyer_name, deal_serial_id=deal.serial_id, shares=shares)
    flask_session.add(transaction)
    buyer.balance = Buyer.balance - amount_needed
    deal.shares_remaining = Deal.shares_remaining - shares
    flask_session.commit()
    # After commit, transaction will be reloaded.
    return transaction


def sell_shares(buyer_name: str, deal_serial_id: int, current_asset_price: float, shares: int) -> Transaction:
    """Sell some shares from a buyer."""
    deal: Deal = flask_session.get(Deal, deal_serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {deal_serial_id} not found")
    if deal.closed:
        abort(409, f"Deal {deal_serial_id} is already closed")
    if datetime.now() > deal.end_time:
        abort(409, f"Deal {deal_serial_id} has ended at {deal.end_time}")
    if deal.open_asset_price is None:
        abort(500, f"Deal {deal_serial_id} missing open asset price")
    buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")
    ownership: Ownership = flask_session.get(
        Ownership, (buyer_name, deal_serial_id), with_for_update={"key_share": True}
    )
    if ownership is None or ownership.shares < shares:
        abort(409, f"Buyer {buyer_name} does not have enough shares to sell {shares} shares")
    ownership.shares = Ownership.shares - shares
    transaction = Transaction(
        buyer_name=buyer_name, deal_serial_id=deal_serial_id, shares=-shares, asset_price=current_asset_price
    )
    flask_session.add(transaction)
    profit = profit_for_buyer(
        deal.open_asset_price, current_asset_price, deal.share_price, deal.rate, shares, deal.multiplier
    )
    buyer.balance = Buyer.balance + shares * deal.share_price + profit
    dealer: Dealer = flask_session.get(Dealer, deal.dealer_name, with_for_update={"key_share": True})
    if not dealer:
        abort(404, f"Dealer {deal.dealer_name} not found")
    dealer.balance = Dealer.balance - profit
    flask_session.commit()
    return transaction


def find_transactions(
    buyer_name: Optional[str] = None,
    deal_serial_id: Optional[int] = None,
) -> Iterable[Transaction]:
    """
    Find an iterable of transactions that satisfy some given filters. The caller may provide
    zero to two criteria. When an argument is None, that means the caller does not want to apply a
    filter for that property.
    """
    query = select(Transaction)
    if buyer_name is not None:
        query = query.where(Transaction.buyer_name == buyer_name)
    if deal_serial_id is not None:
        query = query.where(Transaction.deal_serial_id == deal_serial_id)
    for transaction in flask_session.scalars(query):
        yield transaction
