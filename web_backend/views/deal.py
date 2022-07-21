import requests
from typing import Any, Dict
from flask import Blueprint, abort, current_app, jsonify, request
from werkzeug.exceptions import HTTPException

from dal.deal_dal import (
    close_deal,
    create_deal,
    current_open_deals,
    find_closeable_deal_serial_ids,
    get_deal_by_serial_id,
    patch_deal_open_asset_price,
)
from utils.datetime_utils import format_datetime_str_or_raise
from utils.json_utils import get_not_none


deal_bp = Blueprint("deal", __name__, url_prefix="/deal")


@deal_bp.route("/open", methods=["GET"])
def get_open_deal_ids():
    """
    Request Params:
        max_share_price (Optional[float]): Maximum share price to scan for.

    Returns:
        List of deal IDS that satisfy the constraints. Empty list if None matches.
        Will not return None.
    """
    max_share_price = request.args.get("max_share_price", type=float)
    deals = current_open_deals(max_share_price)
    return jsonify(tuple(deal.serial_id for deal in deals))


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


@deal_bp.route("/", methods=["PATCH"])
def patch_open_asset_price():
    """
    Update an existing deal. If a deal with provided serial_id is not found,
    raise an appropriate error.

    Request Headers:
        Content-Type must be application/json.

    Body Params:
        serial_id (int): Id of the deal
        open_asset_price (float): Asset price at starting time of the deal.

    Returns:
        The deal if the deal is updated. Otherwise, an error will be raised.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    serial_id = get_not_none(request_body_json, "serial_id")
    open_asset_price = get_not_none(request_body_json, "open_asset_price")
    updated_deal = patch_deal_open_asset_price(serial_id, open_asset_price)
    return jsonify({"serial_id": updated_deal.serial_id, "open_asset_price": updated_deal.open_asset_price})


@deal_bp.route("/", methods=["POST"])
def create_new_deal():
    """
    Create a completely new deal. If a deal with an existing name already
    exists, raise an appropriate error.

    Request Headers:
        Content-Type must be application/json.

    Body Params:
        dealer_name (str): Name of the deal to create.
        nft_id (str): Id of the underlying asset.
        share_price (float): Price of each share.
        allowed_rates (List[float]): Unordered list of rates for this deal.
        initial_number_of_shares (int): Starting number of shares to sell.
        start_time (str): Starting time of of the deal.
        end_time (str): Ending time of the deal.

    Returns:
        ID of the deal if the deal is created. Otherwise, an error will be raised.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    dealer_name = get_not_none(request_body_json, "dealer_name")
    nft_id = get_not_none(request_body_json, "nft_id")
    share_price = get_not_none(request_body_json, "share_price")
    allowed_rates = get_not_none(request_body_json, "allowed_rates")
    initial_number_of_shares = get_not_none(request_body_json, "initial_number_of_shares")
    start_time_str = get_not_none(request_body_json, "start_time")
    start_time = format_datetime_str_or_raise(start_time_str, current_app.logger)
    end_time_str = get_not_none(request_body_json, "end_time")
    end_time = format_datetime_str_or_raise(end_time_str, current_app.logger)
    created_deal = create_deal(
        dealer_name, nft_id, share_price, allowed_rates, initial_number_of_shares, start_time, end_time
    )
    response = requests.post(
        f'{current_app.config["SCHEDULER_URL"]}/jobs/close-deal-in-future',
        json={"deal_serial_id": created_deal.serial_id, "end_time": end_time_str},
    )
    response = requests.post(
        f'{current_app.config["SCHEDULER_URL"]}/jobs/patch-open-asset-price-in-future',
        json={"deal_serial_id": created_deal.serial_id, "start_time": start_time_str},
    )
    response.raise_for_status()
    return jsonify(created_deal_serial_id=created_deal.serial_id)


@deal_bp.patch("/<int:serial_id>/close")
def close_deal_by_serial_id(serial_id: int):
    """
    Close a deal by its serial ID.

    Path Params:
        serial_id (int): Id of the deal to close.
    """
    close_deal(serial_id)
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
