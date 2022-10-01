from flask import Blueprint, abort, jsonify, request
from flask_jwt_extended import jwt_required
from dal.dealer_dal import create_dealer, get_dealer_by_name, get_dealers_by_names
from utils.decorators import admin_jwt_required

from utils.json_utils import get_not_none

dealer_bp = Blueprint("dealer", __name__, url_prefix="/dealer")


@dealer_bp.route("/", methods=["POST"])
@jwt_required()
@admin_jwt_required
def create_new_dealer():
    """
    Body Params:
        dealer_name (str): Name of the dealer.
        starting_balance (Optional[float]): Starting balance of the dealer.
            If left unspecified, the dealer will have 0 as the starting balance.

    Returns:
        "OK" if successful.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    dealer_name = get_not_none(request_body_json, "dealer_name")
    starting_balance = request_body_json.get("starting_balance")
    create_dealer(dealer_name.lower(), starting_balance)
    return jsonify("OK")


# TODO: Secure this route
@dealer_bp.route("/", methods=["GET"])
def get_dealers():
    """
    Request Params:
        names (List[str]): Names of the dealers to find. If this parameter
            is not specified, all the dealers will be returned.

    Returns:
        [
            {
                "name": str,
                "balance": float
                "lockup_balance": float
            }
        ]
    """
    names = request.args.getlist("names")
    dealers = get_dealers_by_names([name.lower() for name in names])
    return jsonify(tuple(dealer.info for dealer in dealers))


@dealer_bp.route("/<name>", methods=["GET"])
def get_dealer(name: str):
    """
    Path Params:
        name: Name of the dealer to fetch.
    """
    dealer = get_dealer_by_name(name.lower())
    if dealer is None:
        abort(404, f"Dealer with name {name} is not found")
    return jsonify(dealer.info)
