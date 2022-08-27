"""Contains the buyer information"""
from typing import Dict
from sqlalchemy import CheckConstraint, Column, Float, String
from sqlalchemy.dialects.postgresql import TIMESTAMP
from db import flask_db


class Buyer(flask_db.Model):
    """A buyer model."""

    name = Column(String, primary_key=True)
    balance = Column(Float, CheckConstraint("balance >= 0"), nullable=False, default=0)
    nonce = Column(String, nullable=False)
    nonce_expiration_timestamp = Column(TIMESTAMP, nullable=False)

    @property
    def info(self) -> Dict[str, str | float]:
        return {"name": self.name, "balance": self.balance}
