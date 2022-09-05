from typing import Iterable, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import array_agg

from db import flask_session
from models.ownership_model import Ownership


def find_ownerships(
    closed: Optional[bool] = None,
    buyer_name: Optional[str] = None,
    deal_serial_id: Optional[int] = None,
) -> Iterable[Ownership]:
    """
    Find an iterable of ownerships that satisfy some given filters. The caller may provide
    zero to three criteria. When an argument is None, that means the caller does not want to apply a
    filter for that property.
    """
    query = select(Ownership)
    if closed is not None:
        query = query.filter_by(closed=closed)
    if buyer_name is not None:
        query = query.filter_by(buyer_name=buyer_name)
    if deal_serial_id is not None:
        query = query.filter_by(deal_serial_id=deal_serial_id)
    yield from flask_session.scalars(query)


def prepare_ownerships_for_deal_before_close(deal_serial_id: int) -> Iterable[Tuple[str, List[int]]]:
    """
    For a given deal serial ID, generate an iterable of [buyer_name, List[transaction_id]]
    to prepare the closing of these ownerships.
    """
    yield from flask_session.execute(
        select(Ownership.buyer_name, array_agg(Ownership.transaction_serial_id))
        .filter_by(deal_serial_id=deal_serial_id, closed=False)
        .group_by(Ownership.buyer_name)
    )


def prepare_ownerships_to_sell(deal_serial_id: int, buyer_name: str) -> Iterable[Ownership]:
    """
    For a given deal serial ID and buyer name, give all the ownerships that are not closed.
    """
    yield from prepare_open_ownerships(deal_serial_id, buyer_name, with_for_update=True)


def prepare_ownerships_for_query(deal_serial_id: int, buyer_name: str) -> Iterable[Ownership]:
    """
    For a given deal serial ID and buyer name, give all the ownerships that are not closed.
    """
    yield from prepare_open_ownerships(deal_serial_id, buyer_name, with_for_update=False)


def prepare_open_ownerships(deal_serial_id: int, buyer_name: str, with_for_update: bool) -> Iterable[Ownership]:
    """
    For a given deal serial ID and buyer name, give all the ownerships that are not closed.
    """
    statement = select(Ownership).filter_by(deal_serial_id=deal_serial_id, buyer_name=buyer_name, closed=False)

    if with_for_update:
        statement = statement.with_for_update(key_share=True)

    yield from flask_session.scalars(statement)
