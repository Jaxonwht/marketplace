"""Create the flask instance."""
from logging import INFO
from flask import Flask
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.utils import import_string

from exceptions.error_handlers import handle_http_exception
from views.hello_world import hello_world_bp
from views.counter import counter_bp
from views.deal import deal_bp
from views.dealer import dealer_bp
from views.buyer import buyer_bp
from views.transaction import transaction_bp
from views.ownership import ownership_bp
from views.auth import auth_bp
from db import flask_db
from migrate import flask_migrate
from jwt_manager import jwt


def create_app() -> Flask:
    """Application factory."""
    app = Flask(__name__)
    app.config.from_prefixed_env()

    # Default to configs.Config which is the base configuration shared by all environments.
    flask_config = app.config.get("CONFIG", "Config")
    app.config.from_object(import_string(f"configs.{flask_config}")())

    app.logger.setLevel(app.config.get("MAIN_LOGGING_LEVEL", INFO))  # pylint: disable=no-member

    flask_db.init_app(app)
    flask_migrate.init_app(app, flask_db)
    app.register_blueprint(deal_bp)
    app.register_blueprint(hello_world_bp)
    app.register_blueprint(counter_bp)
    app.register_blueprint(dealer_bp)
    app.register_blueprint(buyer_bp)
    app.register_blueprint(transaction_bp)
    app.register_blueprint(ownership_bp)
    app.register_blueprint(auth_bp)

    jwt.init_app(app)

    app.register_error_handler(HTTPException, handle_http_exception)

    CORS(app)
    return app
