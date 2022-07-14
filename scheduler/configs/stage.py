"""Development config."""
from pathlib import Path
from logging import INFO
from configs.base import Config


class StagingConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used in staging environments."""

    SQLALCHEMY_DATABASE_URI = (Path("/var") / "SQLALCHEMY_DATABASE_URI").read_text()
    SQLALCHEMY_ECHO = False
    MAIN_LOGGING_LEVEL = INFO
