"""Base config."""
from logging import DEBUG


class Config:  # pylint: disable=too-few-public-methods
    """Base configuration shared by all configs."""

    TESTING = False
    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@localhost:5432/local_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    MAIN_LOGGING_LEVEL = DEBUG
    SCHEDULER_URL = "http://localhost:4000"
    JWT_TOKEN_LOCATION = ["headers"]
