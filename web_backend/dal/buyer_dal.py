from typing import Optional
from db import flask_session
from models.buyer_model import Buyer


def get_balance_by_buyer_name(user_name: str) -> Optional[float]:
    """
    If user exists, return the balance. Otherwise, return None.
    """
    buyer_model = get_buyer_by_name(user_name)
    if buyer_model:
        return buyer_model.balance
    return None


def get_buyer_by_name(user_name: str) -> Optional[Buyer]:
    return flask_session.get(Buyer, user_name)
