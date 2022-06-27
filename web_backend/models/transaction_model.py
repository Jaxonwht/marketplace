"""In platform transactions."""
from datetime import datetime

from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import TIMESTAMP

from db import flask_db


class Transaction(flask_db.Model):
    """One transaction of shares."""

    buyer_name = Column(
        String,
        ForeignKey("buyer.name", ondelete="CASCADE"),
        primary_key=True,
    )
    deal_serial_id = Column(Integer, ForeignKey("deal.serial_id", ondelete="CASCADE"), primary_key=True)
    shares = Column(Integer, nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False, default=datetime.now)
    rate = Column(Float, nullable=False)
    close_timestamp = Column(TIMESTAMP, nullable=False)
