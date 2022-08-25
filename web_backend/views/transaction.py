from flask import Blueprint, abort, jsonify, request
from dal.transaction_dal import buy_shares, find_transactions, sell_shares

from utils.json_utils import get_not_none

transaction_bp = Blueprint("transaction", __name__, url_prefix="/transaction")


@transaction_bp.post("/")
def post_transaction():
    """
    Add a transaction to the database. This transaction represents a
    buy or a sell of a buyer with regard to a certain deal.

    Body Params:
        buyer_name (str): Name of the buyer who buys or sells.
        deal_serial_id (int): ID of the deal to enter positions for.
        shares (int): Number of shares to buy or share.

    Returns:
        Serial ID of the created transaction if successful.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Not a valid JSON body")
    buyer_name = get_not_none(request_body_json, "buyer_name")
    deal_serial_id = get_not_none(request_body_json, "deal_serial_id")
    shares = get_not_none(request_body_json, "shares")
    if shares < 0:
        current_asset_price = 0.5  # TODO how to fetch this
        created_transaction = sell_shares(buyer_name, deal_serial_id, current_asset_price, -shares)
        return jsonify(sell_transaction_serial_id=created_transaction.serial_id)
    if shares > 0:
        created_transaction = buy_shares(buyer_name, deal_serial_id, shares)
        return jsonify(buy_transaction_serial_id=created_transaction.serial_id)
    return jsonify("When shares is equal 0, nothing will happen"), 304


@transaction_bp.get("/")
def query_transactions():
    """
    Find a list of transactions that correspond to some user-defined filters.
    The user may omit all filters, in which case, all transactions in the db
    will be returned.

    Request Params:
        buyer_name (Optional[str]): Name of the buyer.
        deal_serial_id (Optional[int]): ID of the deal to query transactions for.

    Returns:
        A list of detaied information about the queried transactions. If no
        transaction matches the given description, an empty list will be returned.
    """
    buyer_name = request.args.get("buyer_name")
    deal_serial_id = request.args.get("deal_serial_id", type=int)
    queried_transactions = find_transactions(buyer_name, deal_serial_id)
    return jsonify(tuple(transaction.info for transaction in queried_transactions))
