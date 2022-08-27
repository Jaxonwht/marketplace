from datetime import datetime, timedelta
import os
from collections.abc import Iterable
from typing import List, Optional

from flask import abort
from sqlalchemy import select
from models.dealer_model import Dealer
from db import flask_session


def create_dealer(dealer_name: str, starting_balance: Optional[float]) -> Dealer:
    if get_dealer_by_name(dealer_name):
        abort(409, f"{dealer_name} already exists as a dealer")
    nonce = os.urandom(32).hex()
    nonce_expiration = datetime.utcnow() + timedelta(minutes=10)
    dealer_model = Dealer(
        name=dealer_name, balance=starting_balance, nonce=nonce, nonce_expiration_timestamp=nonce_expiration
    )
    flask_session.add(dealer_model)
    flask_session.commit()
    return dealer_model


def get_dealer_by_name(dealer_name: str) -> Optional[Dealer]:
    """
    Return the dealer with the name if found and None otherwise.
    """
    return flask_session.get(Dealer, dealer_name)


def get_dealers_by_names(dealer_names: List[str]) -> Iterable[Dealer]:
    if dealer_names:
        for dealer in flask_session.scalars(select(Dealer).where(Dealer.name.in_(dealer_names))):
            yield dealer
    else:
        for dealer in flask_session.scalars(select(Dealer)):
            yield dealer
