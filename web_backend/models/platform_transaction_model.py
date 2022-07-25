"""Actual transaction with the platform in terms of USDC."""
from datetime import datetime

from sqlalchemy import Column, Float, ForeignKey, String, Boolean
from sqlalchemy.dialects.postgresql import TIMESTAMP
from db import flask_db


class PlatformTransaction(flask_db.Model):
    """Transactions that refer to actual monetary transactions."""

    transaction_hash = Column(String, primary_key=True)
    amount = Column(Float)
    timestamp = Column(TIMESTAMP, nullable=False, default=datetime.now)
    buyer_name = Column(String, ForeignKey("buyer.name", ondelete="CASCADE"))
    dealer_name = Column(String, ForeignKey("dealer.name", ondelete="CASCADE"))
    as_dealer = Column(Boolean, nullable=False)
    status = Column(String, nullable=False, index=True)
