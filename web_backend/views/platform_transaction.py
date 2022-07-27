from flask import Blueprint, abort, jsonify, request
from dal.platform_transaction_dal import (
    add_platform_transaction_if_not_exists,
    check_pending_transactions,
    get_platform_transaction,
)
from utils.json_utils import get_not_none


platform_transaction_bp = Blueprint("platform_transaction", __name__, url_prefix="/platform-transaction")


@platform_transaction_bp.post("/<transaction_hash>")
def post_platform_transaction(transaction_hash: str):
    """
    Add a platform transaction to the database. This transaction represents an actual token
    transaction between the user and the platform wallet.

    Path Params:
        transaction_hash (str): Transaction hash on chain.

    Body Params:
        as_dealer (bool): Whether this transaction is meant to add to the dealer balance.

    Returns:
        The transaction_hash back to the caller if successful.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body is not a valid JSON")
    as_dealer: bool = get_not_none(request_body_json, "as_dealer")
    add_platform_transaction_if_not_exists(transaction_hash, as_dealer)
    return jsonify(transaction_hash=transaction_hash)


@platform_transaction_bp.get("/<transaction_hash>")
def get_platform_transaction_by_hash(transaction_hash: str):
    """
    Get a transaction with the provided hash.

    Path Params:
        transaction_hash (str): Transaction hash on chain.

    Returns:
        Information about the transaction.
    """
    return jsonify(get_platform_transaction(transaction_hash).info)


@platform_transaction_bp.post("/check-all-pending")
def check_all_pending_platform_transactions():
    """
    Check all pending platform transactions. No parameters or arguments.

    Returns:
        List of all hashes that have status changes.
    """
    return jsonify(changed_transaction_hashes=check_pending_transactions())
