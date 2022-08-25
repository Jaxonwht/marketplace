"""A deal is one game."""
from typing import Any, Dict, List
from sqlalchemy import Boolean, CheckConstraint, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSON, TIMESTAMP
from sqlalchemy.orm import backref, relationship
from db import flask_db
from models.ownership_model import Ownership
from models.transaction_model import Transaction


class Deal(flask_db.Model):
    """Various information about one deal, which is a game for a duration."""

    serial_id = Column(Integer, primary_key=True)
    dealer_name = Column(String, ForeignKey("dealer.name"))
    collection_id = Column(String, nullable=False)
    asset_id = Column(String)
    share_price = Column(Float, CheckConstraint("share_price > 0"), nullable=False)
    rate = Column(Float, CheckConstraint("rate > 0"), nullable=False)
    shares_remaining = Column(Integer, CheckConstraint("shares_remaining >= 0"), nullable=False)
    open_asset_price = Column(Float, CheckConstraint("open_asset_price > 0"))
    closed_asset_price = Column(Float, CheckConstraint("closed_asset_price > 0"))
    start_time = Column(TIMESTAMP, nullable=False, index=True)
    end_time = Column(TIMESTAMP, nullable=False, index=True)
    closed = Column(Boolean, nullable=False, index=True)
    lockup_balance = Column(Float, CheckConstraint("lockup_balance >= 0"), nullable=False)
    extra_info = Column(JSON)
    collection_name = Column(String, index=True)
    multiplier = Column(Float, nullable=False, default=1)
    transactions: List[Transaction] = relationship(
        Transaction, backref=backref("deal"), cascade="all, delete", passive_deletes=True
    )
    ownerships: List[Ownership] = relationship(
        Ownership, backref=backref("deal"), cascade="all, delete", passive_deletes=True
    )

    @property
    def info(self) -> Dict[str, Any]:
        return {
            "serial_id": self.serial_id,
            "dealer_name": self.dealer_name,
            "collection_id": self.collection_id,
            "asset_id": self.asset_id,
            "share_price": self.share_price,
            "rate": self.rate,
            "shares_remaining": self.shares_remaining,
            "open_asset_price": self.open_asset_price,
            "closed_asset_price": self.closed_asset_price,
            "start_time": str(self.start_time),
            "end_time": str(self.end_time),
            "closed": self.closed,
            "lockup_balance": self.lockup_balance,
            "multiplier": self.multiplier,
            "collection_name": self.collection_name,
            "extra_info": self.extra_info,
        }
