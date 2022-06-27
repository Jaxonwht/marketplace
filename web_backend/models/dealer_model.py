"""Dealer is the party that issues shares."""
from sqlalchemy import Column, Float, String
from sqlalchemy.orm import backref, relationship
from db import flask_db


class Dealer(flask_db.Model):
    """Dealer model."""

    name = Column(String, primary_key=True)
    balance = Column(Float, nullable=False, default=0)
    lockup_balance = Column(Float, nullable=False, default=0)
    deals = relationship("Deal", backref=backref("dealer"), cascade="all, delete", passive_deletes=True)
    platform_transactions = relationship(
        "PlatformTransaction", backref=backref("dealer"), cascade="all, delete", passive_deletes=True
    )
