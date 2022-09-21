from flask import Blueprint, jsonify, request, abort
from dal.ownership_dal import find_ownership_summaries, find_ownerships
from utils.request_args_utils import value_is_true
from dal.ownership_dal import (
    get_deal_details_for_buyer,
)

ownership_bp = Blueprint("ownership", __name__, url_prefix="/ownership")


@ownership_bp.route("/profits-in-deal", methods=["GET"])
def get_profits_in_deal():
    """
    Request Params:
        buyer_name (str): Name of the buyer.
        deal_serial_id (int): Serial ID of deal.

    Returns: Total profits or losses of deal for buyer.
    """
    buyer_name = request.args.get("buyer_name")
    deal_serial_id = request.args.get("deal_serial_id", type=int)
    if buyer_name is None or deal_serial_id is None:
        abort(400, "Buyer name or deal serial id is not specified")
    return jsonify(get_deal_details_for_buyer(buyer_name.lower(), deal_serial_id))


@ownership_bp.get("/profits-summary/<user_name>")
def get_profits_summary(user_name: str):
    """
    Path params:
        user_name (str): Name of the user.

    Request params:
        as_dealer (bool): Whether the user is a dealer as opposed to a buyer.

    Returns: List[OwnershipSummary]. It represents the number of shares
        and total profits of this buyer in all the deals he has a non-zero stake in.
    """
    as_dealer = request.args.get("as_dealer", default=False, type=value_is_true)
    return jsonify(tuple(find_ownership_summaries(user_name.lower(), as_dealer)))


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
    buyer_name_original = request.args.get("buyer_name")
    if buyer_name_original is None:
        buyer_name = None
    else:
        buyer_name = buyer_name_original.lower()
    deal_serial_id = request.args.get("deal_serial_id", type=int)
    closed = request.args.get("closed", type=value_is_true)
    queried_ownerships = find_ownerships(closed, buyer_name, deal_serial_id)
    return jsonify(tuple(ownership.info for ownership in queried_ownerships))
