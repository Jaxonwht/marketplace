from flask import Blueprint, abort, jsonify, request
from dal.ownership_dal import find_ownerships

ownership_bp = Blueprint("ownership", __name__, url_prefix="/ownership")


@ownership_bp.get("/")
def query_ownerships():
    """
    Find a list of ownerships that correspond to some user-defined filters.
    The user may omit all filters, in which case, all ownerships in the db
    will be returned.

    Request Params:
        buyer_name (Optional[str]): Name of the buyer.
        deal_serial_id (Optional[int]): ID of the deal to query ownerships for.

    Returns:
        A list of detaied information about the queried ownerships. If no
        ownership matches the given description, an empty list will be returned.
    """
    buyer_name = request.args.get("buyer_name")
    deal_serial_id = request.args.get("deal_serial_id", type=int)
    queried_ownerships = find_ownerships(buyer_name, deal_serial_id)
    return jsonify(tuple(ownership.info for ownership in queried_ownerships))
