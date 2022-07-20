"""Base config."""
from logging import DEBUG
from pytz import utc
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor


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
    PERPETUAL_SCHEDULER_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODM0NTM5NiwianRpIjoiNjExN2Q0NTUtM2JlMy00ODJjLTkwMjUtNzI5MWM4YjE0YzExIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJhY2NvdW50X3R5cGUiOiJhZG1pbiIsInVzZXJuYW1lIjoic2NoZWR1bGVyIn0sIm5iZiI6MTY1ODM0NTM5Nn0.QTHZk3I-X7AU04fkkFX9xKzqvwXoCyCUwj9RG6y08EA"
