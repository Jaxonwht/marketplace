"""The routes in this view are restricted to admins."""
from flask import Blueprint, abort, current_app, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
from dal.buyer_dal import create_buyer
from jwt_manager import AccountType, MarketplaceIdentity

from utils.decorators import admin_jwt_required
from db import flask_session
from utils.json_utils import get_not_none

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.get("/")
@jwt_required()
@admin_jwt_required
def test_admin_status():
    """Test that the request initator is an admin."""
    return "You are logged in as admin!"


@admin_bp.delete("/all-tables")
@jwt_required()
@admin_jwt_required
def truncate_all_tables():
    """Truncate all tables there is safely."""
    flask_session.execute(
        "TRUNCATE TABLE buyer, counter, deal, dealer, ownership, platform_transaction, transaction RESTART IDENTITY CASCADE"
    )
    flask_session.commit()
    return "All tables truncated"


@admin_bp.get("/perpetual-scheduler-token")
@jwt_required()
@admin_jwt_required
def get_perpetual_scheduler_token():
    """Get an admin JWT token that never expires for the scheduler."""
    access_token = create_access_token(
        MarketplaceIdentity(AccountType.ADMIN, current_app.config["SCHEDULER_USERNAME"]), expires_delta=False
    )
    return jsonify(access_token=access_token)


@admin_bp.route("/create-new-buyer", methods=["POST"])
@jwt_required()
@admin_jwt_required
def create_new_buyer():
    """
    Body Params:
        buyer_name (str): Name of the buyer.
        starting_balance (Optional[float]): Starting balance of the dealer.
            If left unspecified, the dealer will have 0 as the starting balance.

    Returns:
        "OK" if successful.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    buyer_name = get_not_none(request_body_json, "buyer_name")
    starting_balance = request_body_json.get("starting_balance")
    create_buyer(buyer_name, starting_balance)
    return jsonify("OK")
