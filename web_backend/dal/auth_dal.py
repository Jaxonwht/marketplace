import os
from datetime import datetime, timedelta

from flask import abort
from db import flask_session
from models.buyer_model import Buyer
from models.dealer_model import Dealer


def get_nonce_or_create_buyer(buyer_name: str) -> str:
    buyer: Buyer = flask_session.get(Buyer, buyer_name, with_for_update={"key_share": True})
    if buyer is None:
        nonce = os.urandom(32).hex()
        nonce_expiration = datetime.utcnow() + timedelta(minutes=10)
        buyer = Buyer(name=buyer_name, balance=0, nonce=nonce, nonce_expiration_timestamp=nonce_expiration)
        flask_session.add(buyer)
        flask_session.commit()
    elif (buyer.nonce_expiration_timestamp - datetime.utcnow()).total_seconds() < 60:
        nonce = os.urandom(32).hex()
        nonce_expiration = datetime.utcnow() + timedelta(minutes=10)
        buyer.nonce = nonce
        buyer.nonce_expiration_timestamp = nonce_expiration
        flask_session.commit()
    return buyer.nonce


def get_nonce_for_dealer(dealer_name: str) -> str:
    dealer: Dealer = flask_session.get(Dealer, dealer_name, with_for_update={"key_share": True})
    if dealer is None:
        abort(404, f"Dealer {dealer_name} does not exist")
    if (dealer.nonce_expiration_timestamp - datetime.utcnow()).total_seconds() < 60:
        nonce = os.urandom(32).hex()
        nonce_expiration = datetime.utcnow() + timedelta(minutes=10)
        dealer.nonce = nonce
        dealer.nonce_expiration_timestamp = nonce_expiration
        flask_session.commit()
    return dealer.nonce
