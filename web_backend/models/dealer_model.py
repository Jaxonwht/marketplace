"""Dealer is the party that issues shares."""
from db import flask_db


class Dealer(flask_db.Model):
    """Dealer model."""

    name = flask_db.Column(flask_db.String, primary_key=True)
    balance = flask_db.Column(flask_db.Float, nullable=False, default=0)
    lockup_balance = flask_db.Column(flask_db.Float, nullable=False, default=0)
    deals = flask_db.relationship(
        "Deal", backref=flask_db.backref("dealer"), cascade="all, delete", passive_deletes=True
    )
    platform_transactions = flask_db.relationship(
        "PlatformTransaction", backref=flask_db.backref("dealer"), cascade="all, delete", passive_deletes=True
    )
