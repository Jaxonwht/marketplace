from flask import Blueprint, jsonify, request

from dal.deal_dal import current_open_deals


deal_bp = Blueprint("deal", __name__, url_prefix="/deal")


@deal_bp.route("/open", methods=["GET"])
def get_open_deal_names():
    """
    Request Params:
        max_share_price: Maximum share price to scan for.

    Returns:
        List of deal names that satisfy the constraints. Empty list if None matches.
        Will not return None.
    """
    max_share_price = request.args.get("max_share_price", type=float)
    deals = current_open_deals(max_share_price)
    return jsonify(tuple(deal.dealer_name for deal in deals))
