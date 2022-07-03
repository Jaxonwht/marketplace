from collections.abc import Iterable
from datetime import datetime
from typing import Optional
from flask import abort
from sqlalchemy import select
from db import flask_session
from models.buyer_model import Buyer
from models.deal_model import Deal

from models.transaction_model import Transaction


def buy_shares(
    buyer_name: str,
    deal_serial_id: int,
    shares: int,
    rate: float,
) -> Transaction:
    deal = flask_session.get(Deal, deal_serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {deal_serial_id} not found")
    if deal.closed:
        abort(409, f"Deal {deal_serial_id} is already closed")
    if datetime.now() > deal.start_time:
        abort(409, f"Deal {deal_serial_id} has started at {deal.start_time}")
    if rate not in deal.allowed_rates:
        abort(409, f"Deal {deal_serial_id} does have a rate of {rate}%")
    buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")
    user_balance = buyer.balance
    amount_needed = shares * deal.share_price
    if user_balance < amount_needed:
        abort(409, f"Buyer has {user_balance}, need at least {amount_needed}")
    transaction = Transaction(buyer_name=buyer_name, deal_serial_id=deal.serial_id, shares=shares, rate=rate)
    flask_session.add(transaction)
    buyer.balance = Buyer.balance - amount_needed
    deal.shares_remaining = Deal.shares_remaining - shares
    flask_session.commit()
    # After commit, transaction will be reloaded.
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
