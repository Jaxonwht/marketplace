from datetime import datetime
from db import flask_session
from models.buyer_model import Buyer
from models.deal_model import Deal

from models.transaction_model import Transaction


class TransactionException(Exception):
    pass


def buy_shares(
    buyer_name: str,
    deal_name: str,
    shares: int,
    rate: float,
) -> Transaction:
    deal = flask_session.get(Deal, deal_name, with_for_update={"key_share": True})
    if not deal:
        raise TransactionException(f"Deal {deal_name} not found")
    if deal.closed:
        raise TransactionException(f"Deal {deal_name} is already closed")
    if datetime.now() > deal.start_time:
        raise TransactionException(f"Deal {deal_name} has started at {deal.start_time}")
    if rate not in deal.allowed_rates:
        raise TransactionException(f"Deal {deal_name} does have a rate of {rate}%")
    buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
    if buyer is None:
        raise TransactionException(f"Can't find buyer {buyer_name}")
    user_balance = buyer.balance
    amount_needed = shares * deal.share_price
    if user_balance < amount_needed:
        raise TransactionException(f"Buyer has {user_balance}, need at least {amount_needed}")
    transaction = Transaction(buyer_name=buyer_name, shares=shares, rate=rate)
    flask_session.add(transaction)
    buyer.balance = Buyer.balance - amount_needed
    deal.shares_remaining = Deal.shares_remaining - shares
    flask_session.commit()
    # After commit, transaction will be reloaded.
    return transaction
