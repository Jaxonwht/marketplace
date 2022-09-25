from typing import Iterable, List, Optional, Tuple, cast

from datetime import datetime
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import array_agg
from flask import abort

from utils.profits_utils import profit_for_buyer
from db import flask_session
from models.ownership_model import Ownership, OwnershipSummary
from models.transaction_model import Transaction, TransactionInfo
from models.deal_model import Deal
from models.buyer_model import Buyer
from models.dealer_model import Dealer
import nft_utils.deal_info as deal_info


def get_deal_details_for_buyer(buyer_name: str, deal_serial_id: int) -> List[TransactionInfo]:
    deal: Deal = flask_session.get(Deal, deal_serial_id, with_for_update={"key_share": True})
    current_asset_price: float = deal_info.get_deal_current_price(deal)
    if not deal:
        abort(404, f"Deal {deal_serial_id} not found")
    if deal.closed:
        abort(409, f"Deal {deal_serial_id} is already closed")
    if datetime.utcnow() > deal.end_time:
        abort(409, f"Deal {deal_serial_id} has ended at {deal.end_time}")
    buyer = flask_session.get(Buyer, buyer_name)
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")
    transaction_info = []
    for ownership in prepare_ownerships_for_query(deal_serial_id, buyer_name):
        buy_transaction: Transaction = flask_session.get(Transaction, ownership.transaction_serial_id)
        profit = profit_for_buyer(
            buy_transaction.asset_price,
            current_asset_price,
            deal.share_price,
            deal.rate,
            buy_transaction.shares,
            deal.multiplier,
        )
        transaction_info.append(
            TransactionInfo(
                shares=buy_transaction.shares,
                profit=profit,
                buy_timestamp=str(buy_transaction.timestamp),
                buy_asset_price=buy_transaction.asset_price,
            )
        )

    return transaction_info


def find_ownership_summaries(user_name: str, as_dealer: bool) -> Iterable[OwnershipSummary]:
    if not as_dealer:
        for summary in find_buyer_ownership_summaries(user_name):
            yield summary
    else:
        for summary in find_dealer_ownership_summaries(user_name):
            yield summary


def find_buyer_ownership_summaries(
    buyer_name: str,
) -> Iterable[OwnershipSummary]:
    """
    For a given buyer, find all the ownership summary for this user.
    """
    buyer = flask_session.get(Buyer, buyer_name)
    if buyer is None:
        abort(404, f"Can't find buyer {buyer_name}")
    query = (
        select(array_agg(Transaction.serial_id), Transaction.deal_serial_id)
        .join(Ownership)
        .where(~Ownership.closed, Ownership.buyer_name == buyer_name)
        .group_by(Transaction.deal_serial_id)
    )
    for unclosed_transaction_ids, deal_serial_id in flask_session.execute(query):
        deal: Deal = flask_session.get(Deal, deal_serial_id)
        # Here collection_id = contract address; asset_id = token_id
        current_asset_price = deal_info.get_deal_current_price(deal)
        query_for_transactions = select(Transaction).where(Transaction.serial_id.in_(unclosed_transaction_ids))
        total_profit = 0
        total_shares = 0
        for transaction in flask_session.scalars(query_for_transactions):
            total_shares += transaction.shares
            total_profit += profit_for_buyer(
                transaction.asset_price,
                current_asset_price,
                deal.share_price,
                deal.rate,
                transaction.shares,
                deal.multiplier,
            )
        total_cost = total_shares * deal.share_price
        yield OwnershipSummary(
            deal_serial_id=deal_serial_id,
            shares=total_shares,
            profit=total_profit,
            profit_ratio=total_profit / total_cost,
        )


def find_dealer_ownership_summaries(
    dealer_name: str,
) -> Iterable[OwnershipSummary]:
    """
    For a given dealer, find all the ownership summary for this user.
    """
    dealer = flask_session.get(Dealer, dealer_name)
    if dealer is None:
        abort(404, f"Can't find dealer {dealer_name}")
    query = (
        select(array_agg(Transaction.serial_id), Transaction.deal_serial_id)
        .join(Ownership)
        .join(Deal)
        .where(~Ownership.closed, Deal.dealer_name == dealer_name)
        .group_by(Transaction.deal_serial_id)
    )
    for unclosed_transaction_ids, deal_serial_id in flask_session.execute(query):
        # TODO ZIYI get fucking price
        current_asset_price = 10
        deal: Deal = flask_session.get(Deal, deal_serial_id)
        query_for_transactions = select(Transaction).where(Transaction.serial_id.in_(unclosed_transaction_ids))
        total_profit = 0
        total_shares = 0
        for transaction in flask_session.scalars(query_for_transactions):
            total_shares += transaction.shares
            total_profit += profit_for_buyer(
                transaction.asset_price,
                current_asset_price,
                deal.share_price,
                deal.rate,
                transaction.shares,
                deal.multiplier,
            )
        total_cost = total_shares * deal.share_price
        yield OwnershipSummary(
            deal_serial_id=deal_serial_id,
            shares=total_shares,
            profit=-total_profit,
            profit_ratio=-total_profit / total_cost,
        )


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
