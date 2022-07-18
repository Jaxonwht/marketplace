"""Dealer is the party that issues shares."""
from typing import Dict, List
from sqlalchemy import CheckConstraint, Column, Float, String
from sqlalchemy.dialects.postgresql import BYTEA
from sqlalchemy.orm import backref, relationship
from db import flask_db
from models.deal_model import Deal
from models.platform_transaction_model import PlatformTransaction


class Dealer(flask_db.Model):
    """Dealer model."""

    __table_args__ = (CheckConstraint("lockup_balance <= balance"),)

    name = Column(String, primary_key=True)
    balance = Column(Float, CheckConstraint("balance >= 0"), nullable=False, default=0)
    lockup_balance = Column(Float, CheckConstraint("lockup_balance >= 0"), nullable=False, default=0)
    password_hash = Column(BYTEA(32), nullable=False)
    salt = Column(BYTEA(16), nullable=False)
    deals: List[Deal] = relationship(Deal, backref=backref("dealer"), cascade="all, delete", passive_deletes=True)
    platform_transactions: List[PlatformTransaction] = relationship(
        PlatformTransaction, backref=backref("dealer"), cascade="all, delete", passive_deletes=True
    )

    @property
    def info(self) -> Dict[str, str | float]:
        return {"name": self.name, "balance": self.balance, "lockup_balance": self.lockup_balance}
