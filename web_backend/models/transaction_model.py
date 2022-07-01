"""In platform transactions."""
from datetime import datetime

from sqlalchemy import CheckConstraint, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import TIMESTAMP

from db import flask_db


class Transaction(flask_db.Model):
    """One transaction of shares."""

    buyer_name = Column(
        String,
        ForeignKey("buyer.name", ondelete="CASCADE"),
        primary_key=True,
    )
    asset_price = Column(Float, CheckConstraint("asset_price > 0"))
    deal_serial_id = Column(Integer, ForeignKey("deal.serial_id", ondelete="CASCADE"), primary_key=True)
    shares = Column(Integer, nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False, default=datetime.now)
    rate = Column(Float, nullable=False)
