"""Contains the buyer information"""
from db import flask_db


class Buyer(flask_db.Model):
    """A buyer model."""

    name = flask_db.Column(flask_db.String, primary_key=True)
    balance = flask_db.Column(flask_db.Float, nullable=False, default=0)
    transactions = flask_db.relationship(
        "Transaction", backref=flask_db.backref("buyer"), cascade="all, delete", passive_deletes=True
    )
    platform_transactions = flask_db.relationship(
        "PlatformTransaction", backref=flask_db.backref("buyer"), cascade="all, delete", passive_deletes=True
    )
