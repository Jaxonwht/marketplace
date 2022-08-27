from flask import Blueprint, jsonify, request
from dal.ownership_dal import find_ownerships
from utils.request_args_utils import value_is_true

ownership_bp = Blueprint("ownership", __name__, url_prefix="/ownership")


@ownership_bp.get("/")
def query_ownerships():
    """
    Find a list of ownerships that correspond to some user-defined filters.
    The user may omit all filters, in which case, all ownerships in the db
    will be returned.

    Request Params:
        closed (Optional[bool]): Whether to get ownerships that are already
            closed or open. If left unspecified, both types of ownerships
            will be returned.
        buyer_name (Optional[str]): Name of the buyer.
        deal_serial_id (Optional[int]): ID of the deal to query ownerships for.

    Returns:
        A list of detaied information about the queried ownerships. If no
        ownership matches the given description, an empty list will be returned.
    """
    buyer_name = request.args.get("buyer_name")
    deal_serial_id = request.args.get("deal_serial_id", type=int)
    closed = request.args.get("closed", type=value_is_true)
    queried_ownerships = find_ownerships(closed, buyer_name, deal_serial_id)
    return jsonify(tuple(ownership.info for ownership in queried_ownerships))
