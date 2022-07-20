"""The routes in this view are restricted to admins."""
from flask import Blueprint, current_app, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from jwt_manager import AccountType, MarketplaceIdentity

from utils.decorators import admin_jwt_required
from db import flask_session

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
