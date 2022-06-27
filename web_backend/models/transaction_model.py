"""In platform transactions."""
from datetime import datetime

from db import flask_db


class Transaction(flask_db.Model):
    """One transaction of shares."""

    buyer_name = flask_db.Column(
        flask_db.String,
        flask_db.ForeignKey("buyer.name", ondelete="CASCADE"),
        primary_key=True,
    )
    deal_serial_id = flask_db.Column(
        flask_db.Integer, flask_db.ForeignKey("deal.serial_id", ondelete="CASCADE"), primary_key=True
    )
    shares = flask_db.Column(flask_db.Integer, nullable=False)
    timestamp = flask_db.Column(flask_db.TIMESTAMP, nullable=False, default=datetime.now)
    rate = flask_db.Column(flask_db.Float, nullable=False)
    close_timestamp = flask_db.Column(flask_db.TIMESTAMP, nullable=False)
