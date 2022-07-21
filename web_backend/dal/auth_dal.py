import os
from datetime import datetime, timedelta
from db import flask_session
from models.buyer_model import Buyer
from models.dealer_model import Dealer


def get_nonce_or_create_buyer(username: str) -> str:
    dealer = flask_session.get(Dealer, username, with_for_update={"key_share": True})
    if dealer is None:
        buyer = flask_session.get(Buyer, username, with_for_update={"key_share": True})
        if buyer is None:
            nonce = os.urandom(32).hex()
            nonce_expiration = datetime.now() + timedelta(minutes=10)
            buyer = Buyer(name=username, balance=0, nonce=nonce, nonce_expiration_timestamp=nonce_expiration)
            flask_session.add(buyer)
            flask_session.commit()
        elif (buyer.nonce_expiration_timestamp - datetime.now()).total_seconds() < 60:
            nonce = os.urandom(32).hex()
            nonce_expiration = datetime.now() + timedelta(minutes=10)
            buyer.nonce = nonce
            buyer.nonce_expiration_timestamp = nonce_expiration
            flask_session.commit()
        return buyer.nonce
    if (dealer.nonce_expiration_timestamp - datetime.now()).total_seconds() < 60:
        nonce = os.urandom(32).hex()
        nonce_expiration = datetime.now() + timedelta(minutes=10)
        dealer.nonce = nonce
        dealer.nonce_expiration_timestamp = nonce_expiration
        flask_session.commit()
    return dealer.nonce
