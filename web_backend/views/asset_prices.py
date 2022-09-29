from typing import Dict, Optional
from flask import Blueprint, abort, jsonify, request

from dal.deal_dal import get_deal_by_serial_id, get_deals_by_serial_ids
from nft_utils.deal_info import get_deal_current_price, get_deal_prices_history, get_deal_sales_volume


asset_prices_bp = Blueprint("asset_prices", __name__, url_prefix="/asset_prices")


@asset_prices_bp.get("/deal/<int:serial_id>")
def get_deal_asset_latest_price(serial_id: int):
    """
    Path Params:
        serial_id: The id of the deal to fetch latest asset price from.

    Returns:
        The latest price of the underlying asset.
    """
    deal = get_deal_by_serial_id(serial_id)
    if not deal:
        abort(404, f"Deal {serial_id} not found")
    return jsonify(get_deal_current_price(deal))


@asset_prices_bp.get("/deal")
def get_deal_list_asset_latest_prices():
    """
    Request Params:
        serial_ids (List[int]): A list of ids to fetch the latest asset prices from.

    Returns:
        A dictionary in the form of:
        {
            1: 123.5
            2: 51.2,
            3: null,
            ...
        }
    """
    serial_ids = request.args.getlist("serial_ids", type=int)
    if not serial_ids:
        return {}
    prices_to_return: Dict[int, Optional[float]] = {serial_id: None for serial_id in serial_ids}
    for deal in get_deals_by_serial_ids(serial_ids):
        prices_to_return[deal.serial_id] = get_deal_current_price(deal)
    return jsonify(prices_to_return)


@asset_prices_bp.get("/deal/<int:serial_id>/history")
def get_deal_asset_price_history(serial_id: int):
    """
    Path Params:
        serial_id: The id of the deal to fetch history from.

    Returns:
        [
            ["2022-01-01", "2022-01-02"],
            [1.2312, 1.234]
        ]
    """
    deal = get_deal_by_serial_id(serial_id)
    if not deal:
        abort(404, f"Deal {serial_id} not found")
    return jsonify(get_deal_prices_history(deal))


@asset_prices_bp.get("/deal/<int:serial_id>/sales")
def get_deal_asset_sale_volumes(serial_id: int):
    """
    Path Params:
        serial_id: The id of the deal to fetch history from.

    Returns:
        {
            "timestamps": ["2022-01-01", "2022-01-02"],
            "sale_counts": [12, 23],
            "sale_money_values": [1.2312, 1.234]
        ]
    """
    deal = get_deal_by_serial_id(serial_id)
    if not deal:
        abort(404, f"Deal {serial_id} not found")
    timestamps, sale_counts, sale_money_values = get_deal_sales_volume(deal)
    return jsonify(timestamps=timestamps, sale_counts=sale_counts, sale_money_values=sale_money_values)
