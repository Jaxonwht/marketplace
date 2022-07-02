from datetime import datetime
from typing import Iterable, List, Optional

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


def create_deal(
    dealer_name: str,
    nft_id: str,
    share_price: float,
    allowed_rates: List[float],
    initial_number_of_shares: int,
    start_time: datetime,
    end_time: datetime,
) -> Deal:
    new_deal = Deal(
        dealer_name=dealer_name,
        nft_id=nft_id,
        share_price=share_price,
        allowed_rates=allowed_rates,
        shares_remaining=initial_number_of_shares,
        start_time=start_time,
        end_time=end_time,
        closed=False,
    )
    flask_session.add(new_deal)
    flask_session.commit()
    return new_deal
