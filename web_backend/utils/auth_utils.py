from flask import abort
from flask_jwt_extended import get_current_user
from jwt_manager import AccountType, MarketplaceIdentity


def check_is_admin_or_username(username: str) -> None:
    """
    Abort with 401 if the jwt user is not an admin or username is not from
    a whitelisted username.
    """
    identity: MarketplaceIdentity = get_current_user()
    if identity.account_type != AccountType.ADMIN and identity.username != username:
        abort(401, f"Must be either an admin or {username} to access this route")
