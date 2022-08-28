from typing import Any, Dict
from flask_jwt_extended import jwt_required
import requests
from flask import Blueprint, abort, current_app, jsonify, request
from werkzeug.exceptions import HTTPException

from dal.deal_dal import (
    close_deal,
    create_deal,
    get_deals,
    find_closeable_deal_serial_ids,
    get_deal_by_serial_id,
)
from utils.datetime_utils import format_datetime_str_or_raise
from utils.decorators import admin_jwt_required
from utils.json_utils import get_not_none


deal_bp = Blueprint("deal", __name__, url_prefix="/deal")


@deal_bp.route("/", methods=["GET"])
def get_deal_info():
    """
    Request Params:
        max_share_price (Optional[float]): Maximum share price to scan for.
        start_time (Optional[str]): Deals with start_time later than this param.
        end_time (Optional[str]): Deals with end_time earlier than this param.

    Returns:
        List of deal Infos that satisfy the constraints. Empty list if None matches.
        Will not return None.
    """
    max_share_price = request.args.get("max_share_price", type=float)
    start_time_str = request.args.get("start_time")
    if start_time_str:
        start_time = format_datetime_str_or_raise(start_time_str, current_app.logger)
    else:
        start_time = None
    end_time_str = request.args.get("end_time")
    if end_time_str:
        end_time = format_datetime_str_or_raise(end_time_str, current_app.logger)
    else:
        end_time = None
    max_share_price = request.args.get("max_share_price", type=float)
    deals = get_deals(max_share_price, start_time, end_time)
    return jsonify(tuple(deal.info for deal in deals))


@deal_bp.get("/<int:serial_id>")
def get_deal_info_by_id(serial_id: int) -> Dict[str, Any]:
    """
    Path Params:
        serial_id (int): The id of the deal to fetch information from.
    """
    deal = get_deal_by_serial_id(serial_id)
    if not deal:
        abort(404, f"Deal {serial_id} not found")
    return deal.info


@deal_bp.route("/", methods=["POST"])
def create_new_deal():
    """
    Create a completely new deal. If a deal with an existing name already
    exists, raise an appropriate error.

    Request Headers:
        Content-Type must be application/json.

    Body Params:
        dealer_name (str): Name of the deal to create.
        collection_id (str): Id of the underlying collection.
        asset_id (Optional[str]): Id of the underlying asset. If none, this deal is
            aimed for the whole collection.
        share_price (float): Price of each share.
        rate (float): Rate (profit/loss cap) for this deal.
        initial_number_of_shares (int): Starting number of shares to sell.
        start_time (str): Starting time of of the deal.
        end_time (str): Ending time of the deal.
        multiplier (float): How the price of each share moves with respect to the
            underlying asset or collection.

    Returns:
        ID of the deal if the deal is created. Otherwise, an error will be raised.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    dealer_name = get_not_none(request_body_json, "dealer_name")
    collection_id = get_not_none(request_body_json, "collection_id")
    asset_id = request_body_json.get("asset_id")
    share_price = get_not_none(request_body_json, "share_price")
    rate = get_not_none(request_body_json, "rate")
    initial_number_of_shares = get_not_none(request_body_json, "initial_number_of_shares")
    start_time_str = get_not_none(request_body_json, "start_time")
    start_time = format_datetime_str_or_raise(start_time_str, current_app.logger)
    end_time_str = get_not_none(request_body_json, "end_time")
    current_app.logger.info(f"\nFirst {end_time_str}\n")
    end_time = format_datetime_str_or_raise(end_time_str, current_app.logger)
    current_app.logger.info(f"\nFirst {end_time}\n")
    multiplier = get_not_none(request_body_json, "multiplier")
    created_deal = create_deal(
        dealer_name,
        collection_id,
        asset_id,
        share_price,
        rate,
        initial_number_of_shares,
        start_time,
        end_time,
        multiplier,
    )
    response = requests.post(
        f'{current_app.config["SCHEDULER_URL"]}/jobs/close-deal-in-future',
        json={"deal_serial_id": created_deal.serial_id, "end_time": end_time_str},
    )
    response.raise_for_status()
    return jsonify(created_deal_serial_id=created_deal.serial_id)


@deal_bp.patch("/<int:serial_id>/close")
@jwt_required()
@admin_jwt_required
def close_deal_by_serial_id(serial_id: int):
    """
    Close a deal by its serial ID.

    Path Params:
        serial_id (int): Id of the deal to close.
    """
    close_deal(serial_id, True)
    return jsonify(closed_deal_serial_id=serial_id)


@deal_bp.post("/close-all-eligible")
def close_all_closeable_deals():
    """
    Scan for all the deals that should be closed but not yet closed. This method will find each
    of them and attempt to close them. If one deal fails to close, we will still go on to close the
    other deals.
    """
    closeable_ids = find_closeable_deal_serial_ids()
    closed_ids = []
    failed_ids = []
    for closeable_id in closeable_ids:
        try:
            close_deal(closeable_id)
            closed_ids.append(closeable_id)
        except HTTPException:
            current_app.logger.error(f"Failed to close deal {closeable_id}", exc_info=True)
            failed_ids.append(closeable_id)
    return jsonify(closed_deal_ids=closed_ids, failed_to_close_deal_ids=failed_ids)
