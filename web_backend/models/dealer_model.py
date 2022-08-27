"""Dealer is the party that issues shares."""
from typing import Dict
from sqlalchemy import CheckConstraint, Column, Float, String
from sqlalchemy.dialects.postgresql import TIMESTAMP
from db import flask_db


class Dealer(flask_db.Model):
    """Dealer model."""

    __table_args__ = (CheckConstraint("lockup_balance <= balance"),)

    name = Column(String, primary_key=True)
    balance = Column(Float, CheckConstraint("balance >= 0"), nullable=False, default=0)
    lockup_balance = Column(Float, CheckConstraint("lockup_balance >= 0"), nullable=False, default=0)
    nonce = Column(String, nullable=False)
    nonce_expiration_timestamp = Column(TIMESTAMP, nullable=False)

    @property
    def info(self) -> Dict[str, str | float]:
        return {"name": self.name, "balance": self.balance, "lockup_balance": self.lockup_balance}
