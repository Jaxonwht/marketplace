"""The routes in this view are restricted to admins."""
from flask import Blueprint
from flask_jwt_extended import jwt_required

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
    flask_session.execute(
        "TRUNCATE TABLE buyer, counter, deal, dealer, ownership, platform_transaction, transaction RESTART IDENTITY CASCADE"
    )
    flask_session.commit()
    return "All tables truncated"
