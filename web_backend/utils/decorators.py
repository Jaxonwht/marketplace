from functools import wraps
from typing import Any
from flask import abort

from flask_jwt_extended import get_current_user

from jwt_manager import AccountType, MarketplaceIdentity


def admin_jwt_required(function) -> Any:
    """
    Impose an additional restriction on the jwt token received. The JWT token must
    belong to an admin account. This decorator is used to secure essential routes.
    """

    @wraps(function)
    def wrapped_func(*args, **kwargs) -> Any:
        identify: MarketplaceIdentity = get_current_user()
        if identify.account_type != AccountType.ADMIN:
            abort(401, "Admin permission required for this route")
        return function(*args, **kwargs)

    return wrapped_func
