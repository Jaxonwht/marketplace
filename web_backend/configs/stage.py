"""Development config."""
from logging import INFO
from configs.base import Config


class StagingConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used in staging environments."""

    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@db:5432/local_db"
    SQLALCHEMY_ECHO = True
    MAIN_LOGGING_LEVEL = INFO
    SCHEDULER_URL = "http://scheduler-service-prod:4000"
