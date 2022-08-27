from logging import Logger
from typing import Optional
from datetime import datetime, timezone
from dateutil.parser import parse

from flask import abort


def format_datetime_str_or_raise(time_str: str, logger: Optional[Logger] = None) -> datetime:
    """
    Format a time_str or raise a BadRequest.
    """
    try:
        parsed_datetime = parse(time_str)
        if parsed_datetime.tzinfo is None:
            return parsed_datetime
        return parsed_datetime.astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        if logger:
            logger.warn(f"Failed to parse {time_str} as a datetime", exc_info=True)
        abort(400, f"Bad time string {time_str}")
