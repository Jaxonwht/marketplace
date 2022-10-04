from collections.abc import Iterable
from datetime import datetime
from typing import List, Optional
from flask import abort
from sqlalchemy import select
from dal.ownership_dal import prepare_ownerships_to_sell
from db import flask_session
from models.buyer_model import Buyer
from models.deal_model import Deal
from models.dealer_model import Dealer
from models.ownership_model import Ownership
from models.transaction_model import Transaction
from utils.profits_utils import profit_for_buyer
import nft_utils.deal_info as deal_info


def buy_shares(buyer_name: str, deal_serial_id: int, shares: int) -> Transaction:
    deal = flask_session.get(Deal, deal_serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {deal_serial_id} not found")
    if deal.closed:
        abort(409, f"Deal {deal_serial_id} is already closed")
    if datetime.utcnow() > deal.end_time:
        abort(409, f"Deal {deal_serial_id} has ended at {deal.end_time}")
    if deal.shares_remaining < shares:
        abort(409, f"Deal {deal_serial_id} only has {deal.shares_remaining} shares left")
    if shares == 0:
        abort(409, "Shares must be > 0")
    buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")

    user_balance = buyer.balance
    amount_needed = shares * deal.share_price
    if user_balance < amount_needed:
        abort(409, f"Buyer has {user_balance}, need at least {amount_needed}")
    current_asset_price = deal_info.get_deal_current_price(deal)
    transaction = Transaction(
        buyer_name=buyer_name, deal_serial_id=deal.serial_id, shares=shares, asset_price=current_asset_price
    )
    flask_session.add(transaction)
    flask_session.flush([transaction])
    ownership = Ownership(
        buyer_name=buyer_name, deal_serial_id=deal_serial_id, transaction_serial_id=transaction.serial_id, closed=False
    )
    flask_session.add(ownership)
    buyer.balance = Buyer.balance - amount_needed
    deal.shares_remaining = Deal.shares_remaining - shares
    flask_session.commit()
    # After commit, transaction will be reloaded.
    return transaction


def sell_shares(buyer_name: str, deal_serial_id: int) -> List[Transaction]:
    """Sell some shares from a buyer."""
    deal: Deal = flask_session.get(Deal, deal_serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {deal_serial_id} not found")
    if deal.closed:
        abort(409, f"Deal {deal_serial_id} is already closed")
    if datetime.utcnow() > deal.end_time:
        abort(409, f"Deal {deal_serial_id} has ended at {deal.end_time}")
    buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")
    sell_transactions: List[Transaction] = []
    total_profit = 0.0
    total_shares_sold = 0
    current_asset_price = deal_info.get_deal_current_price(deal)
    for ownership in prepare_ownerships_to_sell(deal_serial_id, buyer_name):
        buy_transaction: Transaction = flask_session.get(Transaction, ownership.transaction_serial_id)
        transaction = Transaction(
            buyer_name=buyer_name,
            deal_serial_id=deal_serial_id,
            shares=-buy_transaction.shares,
            asset_price=current_asset_price,
        )
        flask_session.add(transaction)
        profit = profit_for_buyer(
            buy_transaction.asset_price,
            current_asset_price,
            deal.share_price,
            deal.rate,
            buy_transaction.shares,
            deal.multiplier,
        )
        total_shares_sold += buy_transaction.shares
        total_profit += profit
        flask_session.flush([transaction])
        ownership.close_transaction_serial_id = transaction.serial_id
        ownership.closed = True
        sell_transactions.append(transaction)
    buyer.balance = Buyer.balance + total_shares_sold * deal.share_price + total_profit
    dealer: Dealer = flask_session.get(Dealer, deal.dealer_name, with_for_update={"key_share": True})
    if not dealer:
        abort(404, f"Dealer {deal.dealer_name} not found")
    dealer.balance = Dealer.balance - total_profit
    deal.shares_remaining = Deal.shares_remaining + total_shares_sold
    flask_session.commit()
    return sell_transactions


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
