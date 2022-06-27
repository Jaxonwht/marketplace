"""Contains the buyer information"""
from sqlalchemy import Column, Float, String
from sqlalchemy.orm import backref, relationship
from db import flask_db


class Buyer(flask_db.Model):
    """A buyer model."""

    name = Column(String, primary_key=True)
    balance = Column(Float, nullable=False, default=0)
    transactions = relationship("Transaction", backref=backref("buyer"), cascade="all, delete", passive_deletes=True)
    platform_transactions = relationship(
        "PlatformTransaction", backref=backref("buyer"), cascade="all, delete", passive_deletes=True
    )
