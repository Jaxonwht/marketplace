"""Development config."""
from logging import INFO
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from configs.base import Config


class StagingConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used in staging environments."""

    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@db:5432/local_db"
    SCHEDULER_JOBSTORES = {"default": SQLAlchemyJobStore(url=SQLALCHEMY_DATABASE_URI)}
    SQLALCHEMY_ECHO = True
    MAIN_LOGGING_LEVEL = INFO
    WEB_BACKEND_URL = "http://web-backend-service-prod:5000"
