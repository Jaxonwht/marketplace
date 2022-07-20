"""There are some tasks that require periodic execution."""

from typing import cast
import requests
from flask import Flask
from scheduler import scheduler


@scheduler.task("interval", seconds=1, id="close-all-eligible-deals")
def close_all_eligible_deals():
    """Close all the eligible deals that should be closed."""
    app = cast(Flask, scheduler.app)
    jwt_token = app.config["PERPETUAL_SCHEDULER_TOKEN"]
    response = requests.post(
        f'{app.config["WEB_BACKEND_URL"]}/deal/close-all-eligible', headers={"Authorization": f"Bearer {jwt_token}"}
    )
    response.raise_for_status()
