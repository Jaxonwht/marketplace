from datetime import timedelta
from flask import Blueprint, abort, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_current_user, jwt_required
from web3.auto import w3
from eth_account.messages import encode_defunct

from dal.buyer_dal import get_buyer_by_name
from dal.dealer_dal import get_dealer_by_name
from jwt_manager import AccountType, MarketplaceIdentity
from utils.auth_utils import verify_password
from utils.json_utils import get_not_none

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/sign-in-as-dealer")
def sign_in_as_dealer():  # pylint: disable=inconsistent-return-statements
    """
    Sign in as a dealer given that the user is already a buyer. This login uses the Authorization
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
    user_identity = MarketplaceIdentity(AccountType.DEALER, username)
    dealer = get_dealer_by_name(username)
    if dealer is None:
        abort(404, f"Dealer {username} is not found")
    password_match = verify_password(
        password, dealer.password_hash, dealer.salt, current_app.config["PASSWORD_HASH_ITERATIONS"]
    )
    if password_match:
        access_token = create_access_token(user_identity, expires_delta=timedelta(days=1))
        return jsonify(access_token=access_token)
    abort(401, "Password does not match")


@auth_bp.post("/sign-in-as-admin")
def sign_in_as_admin():  # pylint: disable=inconsistent-return-statements
    """
    Sign in with the admin credentials. This login uses the Authorization
    Basic header.
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
    user_identity = MarketplaceIdentity(AccountType.ADMIN, username)
    if username != current_app.config["ADMIN_USERNAME"]:
        abort(401, "Incorrect admin username")
    if password != current_app.config["ADMIN_PASSWORD"]:
        abort(401, "Incorrect admin password")
    access_token = create_access_token(user_identity, expires_delta=timedelta(days=1))
    return jsonify(access_token=access_token)


@auth_bp.post("/sign-in-as-buyer")
def sign_in_as_buyer():  # pylint: disable=inconsistent-return-statements
    """
    Sign in with buyer_name and signature.

    Body Params:
        buyer_name (str): Public address of buyer.
        signature (str): Signature from nonce.
        message_prefix (str): Prefix to form the original message with a nonce.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    buyer_name = get_not_none(request_body_json, "buyer_name")
    signature = get_not_none(request_body_json, "signature")
    message_prefix = get_not_none(request_body_json, "message_prefix")

    buyer = get_buyer_by_name(buyer_name)
    if buyer is None:
        abort(404, f"Buyer {buyer_name} is not found")
    unverified_buyer_name: str = w3.eth.account.recover_message(
        encode_defunct(text=f"{message_prefix}{buyer.nonce}"), signature=signature
    )
    if unverified_buyer_name.lower() != buyer_name.lower():
        abort(401, "Signature verification failed")

    user_identity = MarketplaceIdentity(AccountType.BUYER, buyer_name)
    access_token = create_access_token(user_identity, expires_delta=timedelta(days=1))
    return jsonify(access_token=access_token)


@auth_bp.get("/who-am-i")
@jwt_required()
def identify_self():
    """
    Only a logged-in user will be able to access this route. This is a convenient route to check whether
    the request initiater has the appropriate JWT tokens.
    """
    identity: MarketplaceIdentity = get_current_user()
    return jsonify(identity.as_dict())
