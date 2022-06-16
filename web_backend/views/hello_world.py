"""Hello world api views."""
from flask import Blueprint

hello_world_bp = Blueprint("hello_world", __name__, url_prefix="/hello-world")


@hello_world_bp.route("/", methods=["GET"])
def hello_world() -> str:
    """Test method."""
    return "Hello World"
