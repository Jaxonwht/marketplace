from flask import Blueprint, abort, current_app, jsonify, request

from dal.deal_dal import create_deal, current_open_deals
from utils.datetime_utils import format_datetime_str_or_raise
from utils.json_utils import get_not_none


deal_bp = Blueprint("deal", __name__, url_prefix="/deal")


@deal_bp.route("/open", methods=["GET"])
def get_open_deal_names():
    """
    Request Params:
        max_share_price (Optional[float]): Maximum share price to scan for.

    Returns:
        List of deal names that satisfy the constraints. Empty list if None matches.
        Will not return None.
    """
    max_share_price = request.args.get("max_share_price", type=float)
    deals = current_open_deals(max_share_price)
    return jsonify(tuple(deal.dealer_name for deal in deals))


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
        "OK" if the deal is created. Otherwise, an error will be raised.
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
    create_deal(dealer_name, nft_id, share_price, allowed_rates, initial_number_of_shares, start_time, end_time)
    return jsonify("OK")
