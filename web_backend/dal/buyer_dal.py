from collections.abc import Iterable
from typing import List, Optional
from os import urandom
from datetime import datetime, timedelta
from flask import abort

from sqlalchemy import select
from dal.ownership_dal import prepare_ownerships_for_query
from db import flask_session
from models.buyer_model import Buyer
from models.deal_model import Deal
from models.transaction_model import Transaction, TransactionInfo
from utils.profits_utils import profit_for_buyer


def get_deal_details_for_buyer(buyer_name: str, deal_serial_id: int) -> List[TransactionInfo]:
    current_asset_price: float = 0.01  # TODO: ZIYI
    deal: Deal = flask_session.get(Deal, deal_serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {deal_serial_id} not found")
    if deal.closed:
        abort(409, f"Deal {deal_serial_id} is already closed")
    if datetime.utcnow() > deal.end_time:
        abort(409, f"Deal {deal_serial_id} has ended at {deal.end_time}")
    buyer = flask_session.get(Buyer, buyer_name)
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")
    transaction_info = []
    for ownership in prepare_ownerships_for_query(deal_serial_id, buyer_name):
        buy_transaction: Transaction = flask_session.get(Transaction, ownership.transaction_serial_id)
        profit = profit_for_buyer(
            buy_transaction.asset_price,
            current_asset_price,
            deal.share_price,
            deal.rate,
            buy_transaction.shares,
            deal.multiplier,
        )
        transaction_info.append(
            TransactionInfo(
                shares=buy_transaction.shares,
                profit=profit,
                buy_timestamp=str(buy_transaction.timestamp),
                buy_asset_price=buy_transaction.asset_price,
            )
        )

    return transaction_info


def create_buyer(buyer_name: str, balance: Optional[float]) -> Buyer:
    if get_buyer_by_name(buyer_name):
        abort(409, f"Buyer with name {buyer_name} already exists")
    nonce = urandom(32).hex()
    nonce_expiration = datetime.utcnow() + timedelta(minutes=10)
    buyer_model = Buyer(name=buyer_name, balance=balance, nonce=nonce, nonce_expiration_timestamp=nonce_expiration)
    flask_session.add(buyer_model)
    flask_session.commit()
    return buyer_model


def get_balance_by_buyer_name(buyer_name: str) -> Optional[float]:
    """
    If user exists, return the balance. Otherwise, return None.
    """
    buyer = get_buyer_by_name(buyer_name)
    if buyer:
        return buyer.balance
    return None


def get_buyer_by_name(name: str) -> Optional[Buyer]:
    return flask_session.get(Buyer, name)


def get_buyers_by_names(names: List[str]) -> Iterable[Buyer]:
    if names:
        buyers = flask_session.scalars(select(Buyer).where(Buyer.name.in_(names)))
        for buyer in buyers:
            yield buyer
    else:
        for buyer in flask_session.scalars(select(Buyer)):
            yield buyer
