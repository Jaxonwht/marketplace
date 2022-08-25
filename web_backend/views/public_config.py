"""Public configs."""
from flask import Blueprint, current_app, jsonify

public_config_bp = Blueprint("public_config", __name__, url_prefix="/public-config")


@public_config_bp.get("/")
def get_public_configs():
    """Public configs are configurations that are fine to be used by every public member."""
    config = current_app.config
    return jsonify(
        maximum_allowed_rate=config["MAXIMUM_ALLOWED_RATE"],
        min_start_time_delay_days=config["MIN_START_TIME_DELAY"].days,
        min_end_time_delay_from_start_time_days=config["MIN_END_TIME_DELAY_FROM_START_TIME"].days,
        min_deal_multiplier=config["MIN_DEAL_MULTIPLIER"],
        max_deal_multiplier=config["MAX_DEAL_MULTIPLIER"],
    )
