"""Contains the buyer information"""
from typing import List
from sqlalchemy import CheckConstraint, Column, Float, String
from sqlalchemy.engine import Transaction
from sqlalchemy.orm import backref, relationship
from db import flask_db
from models.platform_transaction_model import PlatformTransaction


class Buyer(flask_db.Model):
    """A buyer model."""

    name = Column(String, primary_key=True)
    balance = Column(Float, CheckConstraint("balance >= 0"), nullable=False, default=0)
    transactions: List[Transaction] = relationship(
        "Transaction", backref=backref("buyer"), cascade="all, delete", passive_deletes=True
    )
    platform_transactions: List[PlatformTransaction] = relationship(
        "PlatformTransaction", backref=backref("buyer"), cascade="all, delete", passive_deletes=True
    )
