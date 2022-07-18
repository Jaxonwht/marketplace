"""A deal is one game."""
from typing import List
from sqlalchemy import Boolean, CheckConstraint, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, TIMESTAMP
from sqlalchemy.orm import backref, relationship
from db import flask_db
from models.ownership_model import Ownership
from models.transaction_model import Transaction


class Deal(flask_db.Model):
    """Various information about one deal, which is a game for a duration."""

    serial_id = Column(Integer, primary_key=True)
    dealer_name = Column(String, ForeignKey("dealer.name"))
    nft_id = Column(String, nullable=False)
    share_price = Column(Float, CheckConstraint("share_price > 0"), nullable=False)
    allowed_rates = Column(ARRAY(Float))
    shares_remaining = Column(Integer, CheckConstraint("shares_remaining >= 0"), nullable=False)
    open_asset_price = Column(Float, CheckConstraint("open_asset_price > 0"))
    closed_asset_price = Column(Float, CheckConstraint("closed_asset_price > 0"))
    start_time = Column(TIMESTAMP, nullable=False)
    end_time = Column(TIMESTAMP, nullable=False)
    closed = Column(Boolean, nullable=False)
    lockup_balance = Column(Float, CheckConstraint("lockup_balance >= 0"), nullable=False)
    transactions: List[Transaction] = relationship(
        Transaction, backref=backref("deal"), cascade="all, delete", passive_deletes=True
    )
    ownerships: List[Ownership] = relationship(
        Ownership, backref=backref("deal"), cascade="all, delete", passive_deletes=True
    )
