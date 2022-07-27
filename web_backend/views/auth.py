from datetime import timedelta
from flask import Blueprint, abort, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_current_user,
    jwt_required,
    set_access_cookies,
    unset_access_cookies,
)
from web3.auto import w3
from web3 import Web3
from eth_account.messages import encode_defunct
from dal.auth_dal import get_nonce_for_dealer, get_nonce_or_create_buyer

from dal.buyer_dal import get_buyer_by_name
from dal.dealer_dal import get_dealer_by_name
from jwt_manager import AccountType, MarketplaceIdentity
from utils.json_utils import get_not_none

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


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


@auth_bp.post("/sign-in")
def sign_in():  # pylint: disable=inconsistent-return-statements
    """
    Sign in with username and signature.

    Request Params:
        as_dealer (Optional[bool]): Whether you want to log in as a dealer.

    Body Params:
        username (str): Public address of the user.
        signature (str): Signature from nonce.
        message_prefix (str): Prefix to form the original message with a nonce.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    username = get_not_none(request_body_json, "username").lower()
    signature = get_not_none(request_body_json, "signature")
    message_prefix = get_not_none(request_body_json, "message_prefix")
    sign_in_as_dealer = request.args.get("as_dealer", False, bool)

    web3_instance = Web3()
    if not web3_instance.isAddress(username):
        abort(400, "Invalid username format")
    if sign_in_as_dealer:
        dealer = get_dealer_by_name(username)
        if dealer is None:
            abort(404, f"Dealer {username} is not found")
        else:
            nonce = dealer.nonce
            account_type = AccountType.DEALER
    else:
        account_type = AccountType.BUYER
        buyer = get_buyer_by_name(username)
        if buyer is None:
            abort(404, f"Buyer {username} is not found")
        else:
            nonce = buyer.nonce
            account_type = AccountType.BUYER
    unverified_buyer_name: str = w3.eth.account.recover_message(
        encode_defunct(text=f"{message_prefix}{nonce}"), signature=signature
    )
    if unverified_buyer_name.lower() != username:
        abort(401, "Signature verification failed")

    user_identity = MarketplaceIdentity(account_type, username)
    access_token = create_access_token(user_identity, expires_delta=timedelta(days=1))
    response = jsonify(access_token=access_token)
    set_access_cookies(response, access_token)
    return response


@auth_bp.post("/sign-out")
@jwt_required()
def sign_out():
    """
    Sign out the user by clearing the user's cookies. However if the user is not logged in
    through cookies. For example, the user might send a bearer token. Then the this route
    practically does not do anything for the requester.
    """
    identity: MarketplaceIdentity = get_current_user()
    response = jsonify(user_signed_out=identity.as_dict())
    unset_access_cookies(response=response)
    return response


@auth_bp.get("/who-am-i")
@jwt_required()
def identify_self():
    """
    Only a logged-in user will be able to access this route. This is a convenient route to check whether
    the request initiater has the appropriate JWT tokens.
    """
    identity: MarketplaceIdentity = get_current_user()
    return jsonify(identity.as_dict())


@auth_bp.get("/<username>/nonce")
def get_nonce(username: str):
    """
    Get nonce for a user. If username doesn't exist, or nonce is expiring in 1 min,
    or nonce has expired, generate a new nounce and expiration of 10 mins. If username
    is not in our record, then the user will become a buyer.

    Path Params:
        username (str): Public address of a user.

    Request Params:
        as_dealer (Optional[bool]): Whether you get the nonce as a dealer.
    """
    web3_instance = Web3()
    if not web3_instance.isAddress(username):
        abort(400, "Invalid username format")
    as_dealer = request.args.get("as_dealer", default=False, type=bool)

    if as_dealer:
        nonce = get_nonce_for_dealer(username.lower())
    else:
        nonce = get_nonce_or_create_buyer(username.lower())
    return jsonify(nonce)
