from datetime import datetime
from typing import Iterable, Optional

from sqlalchemy import select
from db import flask_session
from models.deal_model import Deal


def current_open_deals(max_share_price: Optional[float] = None) -> Iterable[Deal]:
    filters = [Deal.start_time >= datetime.now()]
    if max_share_price is not None:
        filters.append(Deal.share_price <= max_share_price)
    for deal in flask_session.scalars(select(Deal).filter_by(closed=False).where(*filters)):
        yield deal


def get_deal_by_name(deal_name: str) -> Optional[Deal]:
    return flask_session.get(Deal, deal_name)
