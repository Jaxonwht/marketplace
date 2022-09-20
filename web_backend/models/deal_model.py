"""A deal is one game."""
from typing import Any, Dict
from sqlalchemy import Boolean, CheckConstraint, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSON, TIMESTAMP
from db import flask_db


class Deal(flask_db.Model):
    """Various information about one deal, which is a game for a duration."""

    serial_id = Column(Integer, primary_key=True)
    dealer_name = Column(String, ForeignKey("dealer.name"))
    collection_id = Column(String, nullable=False)
    asset_id = Column(String)
    is_nft_index = Column(Boolean, nullable=False)
    share_price = Column(Float, CheckConstraint("share_price > 0"), nullable=False)
    rate = Column(Float, CheckConstraint("rate > 0"), nullable=False)
    shares_remaining = Column(Integer, CheckConstraint("shares_remaining >= 0"), nullable=False)
    closed_asset_price = Column(Float, CheckConstraint("closed_asset_price > 0"))
    start_time = Column(TIMESTAMP, nullable=False, index=True)
    end_time = Column(TIMESTAMP, nullable=False, index=True)
    closed = Column(Boolean, nullable=False, index=True)
    lockup_balance = Column(Float, CheckConstraint("lockup_balance >= 0"), nullable=False)
    extra_info = Column(JSON)
    collection_name = Column(String, nullable=False, index=True)
    multiplier = Column(Float, nullable=False, default=1)

    @property
    def info(self) -> Dict[str, Any]:
        return {
            "serial_id": self.serial_id,
            "dealer_name": self.dealer_name,
            "collection_id": self.collection_id,
            "asset_id": self.asset_id,
            "is_nft_index": self.is_nft_index,
            "share_price": self.share_price,
            "rate": self.rate,
            "shares_remaining": self.shares_remaining,
            "closed_asset_price": self.closed_asset_price,
            "start_time": str(self.start_time),
            "end_time": str(self.end_time),
            "closed": self.closed,
            "lockup_balance": self.lockup_balance,
            "multiplier": self.multiplier,
            "collection_name": self.collection_name,
            "extra_info": self.extra_info,
        }
