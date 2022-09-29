"""Contains information about whether scheduler is ready."""
from flask import Blueprint, abort, current_app, jsonify


scheduler_status_bp = Blueprint("scheduler_status", __name__, url_prefix="/scheduler-status")


@scheduler_status_bp.get("/")
def get_scheduler_status():
    """Test that the request initator is an admin."""
    scheduler_endpoint = current_app.config["SCHEDULER_URL"]
    response = current_app.config["SCHEDULER_REQUEST_SESSION"].get(f"{scheduler_endpoint}/jobs")
    if response.ok:
        return jsonify(connected=True)
    abort(response.status_code, "Failed to connect to scheduler")
