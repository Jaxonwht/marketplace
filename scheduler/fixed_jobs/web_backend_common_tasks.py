"""There are some tasks that require periodic execution."""

from typing import cast
import requests
from flask import Flask
from scheduler import scheduler


@scheduler.task("interval", seconds=1, id="close-all-eligible-deals")
def close_all_eligible_deals():
    """Close all the eligible deals that should be closed."""
    app = cast(Flask, scheduler.app)
    response = requests.post(f'{app.config["WEB_BACKEND_URL"]}/deal/close-all-eligible')
    response.raise_for_status()


@scheduler.task("interval", seconds=5, id="check_pending_platform_transactions")
def check_pending_platform_transactions():
    """Check all the PENDING platform transactions."""
    app = cast(Flask, scheduler.app)
    response = requests.post(f'{app.config["WEB_BACKEND_URL"]}/platform-transaction/check-all-pending')
    response.raise_for_status()
