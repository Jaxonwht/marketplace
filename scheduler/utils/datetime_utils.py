from logging import Logger
from typing import Optional
from datetime import datetime
from dateutil.parser import parse

from flask import abort


def format_datetime_str_or_raise(time_str: str, logger: Optional[Logger] = None) -> datetime:
    """
    Format a time_str or raise a BadRequest.
    """
    try:
        return parse(time_str)
    except Exception:
        if logger:
            logger.warn(f"Failed to parse {time_str} as a datetime", exc_info=True)
        abort(400, f"Bad time string {time_str}")
