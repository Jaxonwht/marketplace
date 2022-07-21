"""Contains the buyer information"""
from typing import Dict, List
from sqlalchemy import CheckConstraint, Column, Float, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.dialects.postgresql import TIMESTAMP
from db import flask_db
from models.ownership_model import Ownership
from models.platform_transaction_model import PlatformTransaction
from models.transaction_model import Transaction


class Buyer(flask_db.Model):
    """A buyer model."""

    name = Column(String, primary_key=True)
    balance = Column(Float, CheckConstraint("balance >= 0"), nullable=False, default=0)
    nonce = Column(String, nullable=False)
    nonce_expiration_timestamp = Column(TIMESTAMP, nullable=False)
    transactions: List[Transaction] = relationship(
        Transaction, backref=backref("buyer"), cascade="all, delete", passive_deletes=True
    )
    platform_transactions: List[PlatformTransaction] = relationship(
        PlatformTransaction, backref=backref("buyer"), cascade="all, delete", passive_deletes=True
    )
    ownerships: List[Ownership] = relationship(
        Ownership, backref=backref("buyer"), cascade="all, delete", passive_deletes=True
    )

    @property
    def info(self) -> Dict[str, str | float]:
        return {"name": self.name, "balance": self.balance}
