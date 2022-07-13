"""Create the flask instance."""


from logging import INFO
from flask import Flask
from flask_apscheduler import APScheduler


def create_app() -> Flask:
    """Application factory."""
    app = Flask(__name__)
    app.config.from_prefixed_env()

    # Default to configs.Config which is the base configuration shared by all environments.
    flask_config = app.config.get("CONFIG", "Config")
    app.config.from_object(f"configs.{flask_config}")

    app.logger.setLevel(app.config.get("MAIN_LOGGING_LEVEL", INFO))  # pylint: disable=no-member

    from views.jobs import jobs_bp  # pylint: disable=import-outside-toplevel

    scheduler = APScheduler()
    scheduler.init_app(app)
    scheduler.start()
    app.register_blueprint(jobs_bp)

    return app
