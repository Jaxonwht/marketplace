"""Create the flask instance."""

from logging import INFO
from flask import Flask
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.utils import import_string
from exceptions.error_handlers import handle_http_exception
from views.jobs import jobs_bp
from scheduler import scheduler
import fixed_jobs.web_backend_common_tasks  # noqa: F401


def create_app() -> Flask:
    """Application factory."""
    app = Flask(__name__)
    app.config.from_prefixed_env()

    # Default to configs.Config which is the base configuration shared by all environments.
    flask_config = app.config.get("CONFIG", "Config")
    app.config.from_object(import_string(f"configs.{flask_config}")())

    app.logger.setLevel(app.config.get("MAIN_LOGGING_LEVEL", INFO))  # pylint: disable=no-member

    scheduler.init_app(app)
    scheduler.start()
    app.register_blueprint(jobs_bp)
    app.register_error_handler(HTTPException, handle_http_exception)
    CORS(app)
    return app
