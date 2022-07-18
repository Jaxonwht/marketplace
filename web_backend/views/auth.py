from flask import Blueprint, abort, current_app, request

from dal.buyer_dal import get_buyer_by_name
from dal.dealer_dal import get_dealer_by_name
from utils.auth_utils import verify_password

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/login")
def login():
    """
    Log in with a set of user name and password. This login uses the Authorization
    Basic header.

    Request Params:
        account_type (str): Must be either "buyer" or "dealer".
    """
    auth_header = request.authorization
    if auth_header is None:
        abort(400, "Authorization header missing")
    username = auth_header.username
    if username is None:
        abort(400, "username is missing in Auth header")
    password = auth_header.password
    if password is None:
        abort(400, "password is missing in Auth header")
    account_type = request.args.get("account_type")
    if account_type not in {"buyer", "dealer"}:
        abort(400, "Account type must be either 'dealer' or 'buyer'")
    if account_type == "buyer":
        buyer = get_buyer_by_name(username)
        if buyer is None:
            abort(404, f"Buyer {username} is not found")
        password_match = verify_password(
            password, buyer.password_hash, buyer.salt, current_app.config["PASSWORD_HASH_ITERATIONS"]
        )
        if password_match:
            return "Login successful"
        abort(401, "Password does not match")
    elif account_type == "dealer":
        dealer = get_dealer_by_name(username)
        if dealer is None:
            abort(404, f"Dealer {username} is not found")
        password_match = verify_password(
            password, dealer.password_hash, dealer.salt, current_app.config["PASSWORD_HASH_ITERATIONS"]
        )
        if password_match:
            return "Login successful"
        abort(401, "Password does not match")
