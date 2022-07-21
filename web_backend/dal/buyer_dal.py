from collections.abc import Iterable
from typing import List, Optional
from os import urandom
from datetime import datetime, timedelta
from flask import abort

from sqlalchemy import select
from db import flask_session
from models.buyer_model import Buyer


def create_buyer(buyer_name: str, balance: Optional[float]) -> Buyer:
    if get_buyer_by_name(buyer_name):
        abort(409, f"Buyer with name {buyer_name} already exists")
    nonce = urandom(32).hex()
    nonce_expiration = datetime.now() + timedelta(minutes=10)
    buyer_model = Buyer(name=buyer_name, balance=balance, nonce=nonce, nonce_expiration_timestamp=nonce_expiration)
    flask_session.add(buyer_model)
    flask_session.commit()
    return buyer_model


def get_balance_by_buyer_name(buyer_name: str) -> Optional[float]:
    """
    If user exists, return the balance. Otherwise, return None.
    """
    buyer_model = get_buyer_by_name(buyer_name)
    if buyer_model:
        return buyer_model.balance
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
