from dataclasses import dataclass
from enum import Enum
from typing import Dict
from flask_jwt_extended import JWTManager

jwt = JWTManager()


class AccountType(Enum):
    """Account types supported in marketplace."""

    BUYER = "buyer"
    DEALER = "dealer"
    ADMIN = "admin"


@dataclass
class MarketplaceIdentity:
    """The JWT user identity for marketplace."""

    account_type: AccountType
    username: str

    def as_dict(self) -> Dict[str, str]:
        """JSON serializable form."""
        return {"account_type": self.account_type.value, "username": self.username}


@jwt.user_identity_loader
def user_identity_loader(identity: MarketplaceIdentity) -> Dict[str, str]:
    """Serialized form used in jwt hashing."""
    return identity.as_dict()


@jwt.user_lookup_loader
def user_lookup_loader(_jwt_header: Dict, jwt_data: Dict) -> MarketplaceIdentity:
    """Deserialize a jwt key content."""
    return MarketplaceIdentity(AccountType(jwt_data["sub"]["account_type"]), jwt_data["sub"]["username"])
