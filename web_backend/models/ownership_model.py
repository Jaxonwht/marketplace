"""Stores the aggregated ownership of specific shares by different buyers."""
from typing import Dict

from sqlalchemy import CheckConstraint, Column, Float, ForeignKey, Integer, String

from db import flask_db


class Ownership(flask_db.Model):
    """One transaction of shares."""

    buyer_name = Column(String, ForeignKey("buyer.name", ondelete="CASCADE"), nullable=False, primary_key=True)
    deal_serial_id = Column(Integer, ForeignKey("deal.serial_id", ondelete="CASCADE"), nullable=False, primary_key=True)
    rate = Column(Float, nullable=False, primary_key=True)
    shares = Column(Integer, CheckConstraint("shares >= 0"), nullable=False)

    @property
    def info(self) -> Dict[str, str | int | float]:
        return {
            "buyer_name": self.buyer_name,
            "deal_serial_id": self.deal_serial_id,
            "rate": self.rate,
            "shares": self.shares,
        }
