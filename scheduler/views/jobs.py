"""Jobs api views."""
from flask import Blueprint

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")


@jobs_bp.route("/", methods=["GET"])
def jobs() -> str:
    """Test method."""
    return "jobs"
