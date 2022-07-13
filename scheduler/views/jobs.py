"""Jobs api views."""
from flask import Blueprint, jsonify

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")


@jobs_bp.route("/", methods=["GET"])
def jobs():
    """Test method."""
    return jsonify("jobs")
