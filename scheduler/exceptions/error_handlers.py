from typing import Tuple, cast
from flask import jsonify
from flask.wrappers import Response
from werkzeug.exceptions import HTTPException


def handle_http_exception(error: HTTPException) -> Tuple[Response, int]:
    """Serialize the http exception into a JSON."""
    return jsonify(error=str(error)), cast(int, error.code)
