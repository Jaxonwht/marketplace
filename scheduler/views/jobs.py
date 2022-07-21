"""Jobs api views."""
import requests
from flask import Blueprint, abort, current_app, jsonify, request
from utils.datetime_utils import format_datetime_str_or_raise
from utils.json_utils import get_not_none
from scheduler import scheduler

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")


@jobs_bp.route("/", methods=["GET"])
def jobs():
    """Test method."""
    return jsonify("jobs")


def _request_close_deal(web_backend_url: str, serial_id: int, jwt_token: str) -> None:
    response = requests.patch(
        f"{web_backend_url}/deal/{serial_id}/close", headers={"Authorization": f"Bearer {jwt_token}"}
    )
    response.raise_for_status()


def _request_patch_price(web_backend_url: str, serial_id: int, jwt_token: str) -> None:
    response = requests.patch(
        f"{web_backend_url}/deal/",
        headers={"Authorization": f"Bearer {jwt_token}"},
        json={"serial_id": serial_id, "open_asset_price": 0.8},  # TODO ziyi
    )
    response.raise_for_status()


@jobs_bp.post("/close-deal-in-future")
def close_deal_in_future():
    """
    Post a job that will close a deal exactly at the ending time of the deal.

    Body Params:
        deal_serial_id (int): Serial ID of the deal to close.
        end_time (str): A string representing the datetime to close the deal.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body should not be empty")
    deal_serial_id: int = get_not_none(request_body_json, "deal_serial_id")
    end_time_str: str = get_not_none(request_body_json, "end_time")
    end_time = format_datetime_str_or_raise(end_time_str, current_app.logger)
    web_backend_url = current_app.config["WEB_BACKEND_URL"]
    jwt_token = current_app.config["PERPETUAL_SCHEDULER_TOKEN"]
    job = scheduler.add_job(
        "close-deal-when-ended",
        _request_close_deal,
        trigger="date",
        run_date=end_time,
        args=(web_backend_url, deal_serial_id, jwt_token),
        replace_existing=True,
    )
    return jsonify(job_id=job.id)


@jobs_bp.post("/patch-open-asset-price-in-future")
def patch_open_asset_price_in_future():
    """
    Post a job that will patch the open asset price of the deal exactly at the
    starting time of the deal.

    Body Params:
        deal_serial_id (int): Serial ID of the deal to close.
        start_time (str): A string representing the datetime to start the deal.
    """
    request_body_json = request.json
    if request_body_json is None:
        abort(400, "Request body should not be empty")
    deal_serial_id: int = get_not_none(request_body_json, "deal_serial_id")
    start_time_str: str = get_not_none(request_body_json, "start_time")
    start_time = format_datetime_str_or_raise(start_time_str, current_app.logger)
    web_backend_url = current_app.config["WEB_BACKEND_URL"]
    jwt_token = current_app.config["PERPETUAL_SCHEDULER_TOKEN"]
    job = scheduler.add_job(
        "patch-open-asset-price-when-added",
        _request_patch_price,
        trigger="date",
        run_date=start_time,
        args=(web_backend_url, deal_serial_id, jwt_token),
        replace_existing=True,
    )
    return jsonify(job_id=job.id)
