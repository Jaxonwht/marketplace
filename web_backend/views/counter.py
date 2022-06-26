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
    return jsonify(get_current_counter())


@counter_bp.route("/initialize", methods=["GET"])
def initialize_counter():
    initialize_counter_to_zero()
    return jsonify("OK")


@counter_bp.route("/add", methods=["GET"])
def increase_counter():
    change = request.args.get("change", default=1, type=int)
    return jsonify(change_counter(change).number)


@counter_bp.route("/reduce", methods=["GET"])
def reduce_counter():
    change = request.args.get("change", default=1, type=int)
    return jsonify(change_counter(-change).number)
