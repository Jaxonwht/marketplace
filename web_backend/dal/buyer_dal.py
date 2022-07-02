from collections.abc import Iterable
from typing import List, Optional

from sqlalchemy import select
from db import flask_session
from models.buyer_model import Buyer


def create_buyer(buyer_name: str, balance: Optional[float]) -> Buyer:
    buyer_model = Buyer(name=buyer_name, balance=balance)
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


def get_byers_by_names(names: List[str]) -> Iterable[Buyer]:
    if names:
        buyers = flask_session.scalars(select(Buyer).where(Buyer.name.in_(names)))
        for buyer in buyers:
            yield buyer
    else:
        for buyer in flask_session.scalars(select(Buyer)):
            yield buyer
