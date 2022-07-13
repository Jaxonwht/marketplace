from typing import Any, Dict

from flask import abort


def get_not_none(data: Dict[str, Any], field_name: str) -> Any:
    """
    In a request, require that a field is not None, otherwise raise a BadRequest error.
    """
    field = data.get(field_name)
    if field is None:
        abort(400, f"Required field {field_name} doesn't exist in the data")
    return field
