"""Actual transaction with the platform in terms of USDC."""
from datetime import datetime
from enum import Enum
from typing import Any, Dict

from sqlalchemy import Column, Float, ForeignKey, String, Boolean
from sqlalchemy.dialects.postgresql import ENUM, TIMESTAMP
from db import flask_db


class PlatformTransactionStatus(Enum):
    """Possible statuses of a crypto transaction."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ATTENTION_NEEDED = "attention_needed"


class PlatformTransaction(flask_db.Model):
    """Transactions that refer to actual monetary transactions."""

    transaction_hash = Column(String, primary_key=True)
    # Positive represents going into the platform.
    amount = Column(Float)
    amount_without_fees = Column(Float)
    timestamp = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    buyer_name = Column(String, ForeignKey("buyer.name", ondelete="CASCADE"))
    dealer_name = Column(String, ForeignKey("dealer.name", ondelete="CASCADE"))
    as_dealer = Column(Boolean, nullable=False)
    status = Column(ENUM(PlatformTransactionStatus), nullable=False, index=True)
    # Any message that can be useful if a transaction fails verification.
    verification_info = Column(String)

    @property
    def info(self) -> Dict[str, Any]:
        """Serializable information about transaction."""
        return {
            "transaction_hash": self.transaction_hash,
            "amount": self.amount,
            "timestamp": self.timestamp,
            "buyer_name": self.buyer_name,
            "dealer_name": self.dealer_name,
            "as_dealer": self.as_dealer,
            "status": self.status.value,
            "verification_info": self.verification_info,
        }
