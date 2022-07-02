"""Development config."""

from logging import INFO
from configs.base import Config


class ProductionConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used during production."""

    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@host.docker.internal:5432/local_db"
    SQLALCHEMY_ECHO = False
    MAIN_LOGGING_LEVEL = INFO
