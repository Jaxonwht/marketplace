"""Base config."""
from logging import DEBUG
from pytz import utc
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from requests import Session


class Config:  # pylint: disable=too-few-public-methods
    """Base configuration shared by all configs."""

    TESTING = False
    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@localhost:5432/local_db"
    SCHEDULER_API_ENABLED = True

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    MAIN_LOGGING_LEVEL = DEBUG
    SCHEDULER_JOBSTORES = {"default": SQLAlchemyJobStore(url=SQLALCHEMY_DATABASE_URI)}

    SCHEDULER_EXECUTORS = {
        "default": ThreadPoolExecutor(5),
    }
    SCHEDULER_JOB_DEFAULTS = {"max_instances": 3}
    SCHEDULER_TIMEZONE = utc
    WEB_BACKEND_URL = "http://localhost:5000"
    WEB_BACKEND_SESSION = Session()
