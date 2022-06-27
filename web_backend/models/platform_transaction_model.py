"""Actual transaction with the platform in terms of USDC."""
from datetime import datetime
from db import flask_db


class PlatformTransaction(flask_db.Model):
    """Transactions that refer to actual monetary transactions."""

    id = flask_db.Column(flask_db.Integer, primary_key=True)
    amount = flask_db.Column(flask_db.Float, nullable=False)
    timestamp = flask_db.Column(flask_db.TIMESTAMP, nullable=False, default=datetime.now)
    buyer_name = flask_db.Column(flask_db.String, flask_db.ForeignKey("buyer.name", ondelete="CASCADE"))
    dealer_name = flask_db.Column(flask_db.String, flask_db.ForeignKey("dealer.name", ondelete="CASCADE"))
