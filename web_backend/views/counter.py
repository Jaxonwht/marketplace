"""Simple counter view"""
from flask import Blueprint, jsonify, request
from werkzeug.exceptions import NotFound

from dal.counter_dal import change_counter, get_current_counter, initialize_counter_to_zero

counter_bp = Blueprint("counter", __name__, url_prefix="/counter")


@counter_bp.route("/", methods=["GET"])
def get_counter():
    """
    Return current counter.
    """
    counter = get_current_counter()
    if counter:
        return jsonify(counter.number)
    return NotFound()


@counter_bp.route("/initialize", methods=["POST"])
def initialize_counter():
    initialize_counter_to_zero()
    return jsonify("OK")


@counter_bp.route("/add", methods=["PATCH"])
def increase_counter():
    change = request.args.get("change", default=1, type=int)
    changed_counter = change_counter(change)
    if changed_counter:
        return jsonify(changed_counter.number)
    return NotFound()


@counter_bp.route("/reduce", methods=["PATCH"])
def reduce_counter():
    change = request.args.get("change", default=1, type=int)
    changed_counter = change_counter(-change)
    if changed_counter:
        return jsonify(changed_counter.number)
    return NotFound()
