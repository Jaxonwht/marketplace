"""Stores the aggregated ownership of specific shares by different buyers."""
from typing import Any, Dict

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String

from db import flask_db


class Ownership(flask_db.Model):
    """One transaction of shares."""

    buyer_name = Column(String, ForeignKey("buyer.name", ondelete="CASCADE"), primary_key=True)
    deal_serial_id = Column(Integer, ForeignKey("deal.serial_id", ondelete="CASCADE"), primary_key=True)
    transaction_serial_id = Column(Integer, ForeignKey("transaction.serial_id", ondelete="CASCADE"), primary_key=True)
    # This specific ownership is already cleared.
    closed = Column(Boolean, nullable=False, index=True)
    close_transaction_serial_id = Column(Integer, nullable=True)

    @property
    def info(self) -> Dict[str, Any]:
        return {
            "buyer_name": self.buyer_name,
            "deal_serial_id": self.deal_serial_id,
            "transaction_serial_id": self.transaction_serial_id,
            "closed": self.closed,
            "close_transaction_serial_id": self.close_transaction_serial_id,
        }
