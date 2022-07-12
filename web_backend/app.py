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

    # Initialize scheduler
    scheduler = APScheduler()
    # Set options
    # scheduler.api_enabled = True
    scheduler.init_app(app)
    scheduler.start()

    app.logger.setLevel(app.config.get("MAIN_LOGGING_LEVEL", INFO))  # pylint: disable=no-member

    from views.hello_world import hello_world_bp  # pylint: disable=import-outside-toplevel
    from views.counter import counter_bp  # pylint: disable=import-outside-toplevel
    from views.deal import deal_bp  # pylint: disable=import-outside-toplevel
    from views.dealer import dealer_bp  # pylint: disable=import-outside-toplevel
    from views.buyer import buyer_bp  # pylint: disable=import-outside-toplevel
    from views.transaction import transaction_bp  # pylint: disable=import-outside-toplevel
    from views.ownership import ownership_bp  # pylint: disable=import-outside-toplevel
    from db import flask_db  # pylint: disable=import-outside-toplevel
    from migrate import flask_migrate  # pylint: disable=import-outside-toplevel

    flask_db.init_app(app)
    flask_migrate.init_app(app, flask_db)
    app.register_blueprint(deal_bp)
    app.register_blueprint(hello_world_bp)
    app.register_blueprint(counter_bp)
    app.register_blueprint(dealer_bp)
    app.register_blueprint(buyer_bp)
    app.register_blueprint(transaction_bp)
    app.register_blueprint(ownership_bp)

    return app
