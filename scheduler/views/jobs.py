"""Jobs api views."""
from flask import Blueprint, abort, current_app, jsonify, request
from utils.datetime_utils import format_datetime_str_or_raise
from utils.json_utils import get_not_none
from scheduler import scheduler

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")


@jobs_bp.route("/", methods=["GET"])
def jobs():
    """Test method."""
    return jsonify("jobs")


def _request_close_deal(web_backend_url: str, serial_id: int) -> None:
    response = current_app.config["WEB_BACKEND_SESSION"].patch(f"{web_backend_url}/deal/{serial_id}/close")
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
    job = scheduler.add_job(
        "close-deal-when-ended",
        _request_close_deal,
        trigger="date",
        run_date=end_time,
        args=(web_backend_url, deal_serial_id),
        replace_existing=True,
    )
    return jsonify(job_id=job.id)
