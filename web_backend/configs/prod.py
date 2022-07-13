"""Development config."""

import os
from logging import INFO
from configs.base import Config


class ProductionConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used during production."""

    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "SQLALCHEMY_DATABASE_URI not specified")
    SQLALCHEMY_ECHO = False
    MAIN_LOGGING_LEVEL = INFO
