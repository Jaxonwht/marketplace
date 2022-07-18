from typing import Tuple, cast
from flask import jsonify
from flask.wrappers import Response
from werkzeug.exceptions import HTTPException


def handle_http_exception(exception: HTTPException) -> Tuple[Response, int]:
    """
    Serialize all the HTTP Exceptions.
    """
    return jsonify(error=str(exception)), cast(int, exception.code)
