from flask import Blueprint, abort, jsonify, request
from dal.buyer_dal import get_buyer_by_name, get_buyers_by_names, get_nonce_or_create_buyer

from utils.json_utils import get_not_none

buyer_bp = Blueprint("buyer", __name__, url_prefix="/buyer")


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
    buyers = get_buyers_by_names(names)
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


@buyer_bp.get("/<buyer_name>/nonce")
def get_nonce(buyer_name: str):
    """
    Get nonce for buyer_name. If buyer_name doesn't exist, or nonce is expiring in 1 min,
    or nonce has expired, generate a new nounce and expiration of 10 mins.

    Path Params:
        buyer_name (str): Public address of buyer.
    """
    buyer = get_nonce_or_create_buyer(buyer_name)
    return jsonify(str(buyer.nonce))
