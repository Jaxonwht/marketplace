"""Development config."""
import os
from logging import INFO
from configs.base import Config


class StagingConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used in staging environments."""

    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "SQLALCHEMY_DATABASE_URI not specified")
    SQLALCHEMY_ECHO = True
    MAIN_LOGGING_LEVEL = INFO
