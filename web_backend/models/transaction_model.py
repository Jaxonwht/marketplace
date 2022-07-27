"""In platform transactions."""
from datetime import datetime
from typing import Dict

from sqlalchemy import CheckConstraint, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import TIMESTAMP

from db import flask_db


class Transaction(flask_db.Model):
    """One transaction of shares."""

    serial_id = Column(Integer, primary_key=True)
    buyer_name = Column(String, ForeignKey("buyer.name", ondelete="CASCADE"), nullable=False)
    asset_price = Column(Float, CheckConstraint("asset_price > 0"))
    deal_serial_id = Column(Integer, ForeignKey("deal.serial_id", ondelete="CASCADE"), nullable=False)
    # Positive means buyer buying. Negative means buyer selling.
    shares = Column(Integer, nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False, default=datetime.now)
    rate = Column(Float, nullable=False)

    @property
    def info(self) -> Dict[str, str | int | float]:
        return {
            "serial_id": self.serial_id,
            "buyer_name": self.buyer_name,
            "asset_price": self.asset_price,
            "deal_serial_id": self.deal_serial_id,
            "shares": self.shares,
            "timestamp": str(self.timestamp),
            "rate": self.rate,
        }
