"""A deal is one game."""
from sqlalchemy.dialects.postgresql import ARRAY
from db import flask_db
from models.transaction_model import Transaction


class Deal(flask_db.Model):
    """Various information about one deal, which is a game for a duration."""

    serial_id = flask_db.Column(flask_db.Integer, primary_key=True)
    dealer_name = flask_db.Column(flask_db.String, flask_db.ForeignKey("dealer.name"))
    nft_id = flask_db.Column(flask_db.String, nullable=False)
    share_price = flask_db.Column(flask_db.Float, nullable=False)
    allowed_rates = flask_db.Column(ARRAY(flask_db.Float))
    shares_remaining = flask_db.Column(flask_db.Integer, nullable=False)
    start_time = flask_db.Column(flask_db.TIMESTAMP, nullable=False)
    end_time = flask_db.Column(flask_db.TIMESTAMP, nullable=False)
    closed = flask_db.Column(flask_db.Boolean, nullable=False)
    buyers = flask_db.relationship("Buyer", secondary=Transaction.__table__, backref=flask_db.backref("deals"))
    transactions = flask_db.relationship(
        "Transaction", backref=flask_db.backref("deal"), cascade="all, delete", passive_deletes=True
    )
