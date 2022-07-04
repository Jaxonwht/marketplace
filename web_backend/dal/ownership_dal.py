from typing import Iterable, Optional

from sqlalchemy import select

from db import flask_session
from models.ownership_model import Ownership


def find_ownerships(
    buyer_name: Optional[str] = None,
    deal_serial_id: Optional[int] = None,
) -> Iterable[Ownership]:
    """
    Find an iterable of ownerships that satisfy some given filters. The caller may provide
    zero to two criteria. When an argument is None, that means the caller does not want to apply a
    filter for that property.
    """
    query = select(Ownership)
    if buyer_name is not None:
        query = query.where(Ownership.buyer_name == buyer_name)
    if deal_serial_id is not None:
        query = query.where(Ownership.deal_serial_id == deal_serial_id)
    for ownership in flask_session.scalars(query):
        yield ownership
