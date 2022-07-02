from flask import Blueprint, abort, jsonify, request
from dal.buyer_dal import create_buyer, get_buyer_by_name, get_byers_by_names
from dal.deal_dal import get_deal_by_name

from utils.json_utils import get_not_none

buyer_bp = Blueprint("buyer", __name__, url_prefix="/buyer")


@buyer_bp.route("/", methods=["POST"])
def create_new_buyer():
    """
    Body Params:
        buyer_name (str): Name of the buyer.
        starting_balance (Optional[float]): Starting balance of the dealer.
            If left unspecified, the dealer will have 0 as the starting balance.

    Returns:
        "OK" if successful.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    buyer_name = get_not_none(request_body_json, "buyer_name")
    if get_deal_by_name(buyer_name):
        abort(409, f"Buyer with name {buyer_name} already exists")
    starting_balance = request_body_json.get("starting_balance")
    create_buyer(buyer_name, starting_balance)
    return jsonify("OK")


@buyer_bp.route("/", methods=["GET"])
def get_buyers():
    """
    Request Params:
        names (List[str]): Names of the buyers to find. If this parameter
            is not specified, all the buyers will be returned.

    Returns:
        [
            {
                "name": str,
                "balance": float
            }
        ]
    """
    names = request.args.getlist("names")
    buyers = get_byers_by_names(names)
    return jsonify(tuple(buyer.info for buyer in buyers))


@buyer_bp.route("/<name>", methods=["GET"])
def get_buyer(name: str):
    """
    Path Params:
        name: Name of the buyer to fetch.
    """
    buyer = get_buyer_by_name(name)
    if buyer is None:
        abort(404, f"Buyer with name {name} is not found")
    return jsonify(buyer.info)
