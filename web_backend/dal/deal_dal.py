from datetime import datetime
from typing import Iterable, List, Optional
from flask import abort

from sqlalchemy import select
from db import flask_session
from models.deal_model import Deal
from models.dealer_model import Dealer


# Maximum allowed rate of profit or loss.
_MAXIMUM_ALLOWED_RATE = 0.2


def current_open_deals(max_share_price: Optional[float] = None) -> Iterable[Deal]:
    filters = [Deal.start_time >= datetime.now()]
    if max_share_price is not None:
        filters.append(Deal.share_price <= max_share_price)
    for deal in flask_session.scalars(select(Deal).filter_by(closed=False).where(*filters)):
        yield deal


def get_deal_by_name(deal_name: str) -> Optional[Deal]:
    return flask_session.get(Deal, deal_name)


def patch_deal_open_asset_price(serial_id: int, open_asset_price: float) -> Deal:
    if open_asset_price <= 0:
        abort(400, f"Open asset price must be positive")
    deal = flask_session.get(Deal, serial_id, with_for_update={"key_share": True})
    if not deal:
        abort(404, f"Deal {serial_id} not found")
    deal.open_asset_price = open_asset_price
    flask_session.commit()
    return deal


def create_deal(
    dealer_name: str,
    nft_id: str,
    share_price: float,
    allowed_rates: List[float],
    initial_number_of_shares: int,
    start_time: datetime,
    end_time: datetime,
) -> Deal:
    if not allowed_rates:
        abort(400, "You must specify non-empty list of allowed rates")
    for rate in allowed_rates:
        if rate <= 0 or rate > _MAXIMUM_ALLOWED_RATE:
            abort(400, f"The rate {rate} does not fall within the range of (0, {_MAXIMUM_ALLOWED_RATE}]")
    if share_price <= 0:
        abort(400, "Share price must be positive")
    if initial_number_of_shares <= 0:
        abort(400, "Initial number of shares must be positive")
    dealer = flask_session.get(Dealer, dealer_name, with_for_update={"key_share": True})
    if not dealer:
        abort(404, f"Dealer {dealer_name} not found")
    amount_needed = (1 + max(allowed_rates)) * share_price * initial_number_of_shares
    if dealer.lockup_balance + amount_needed >= dealer.balance:
        abort(
            409,
            f"Issuing these shares require a balance of {dealer.lockup_balance + amount_needed}, but the dealer only has {dealer.balacne}",
        )
    dealer.lockup_balance = Dealer.lockup_balance + amount_needed
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
