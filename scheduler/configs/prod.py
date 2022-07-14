"""Development config."""
from pathlib import Path
from logging import INFO
from configs.base import Config
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore


class ProductionConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used during production."""

    SQLALCHEMY_DATABASE_URI = (Path("/var") / "SQLALCHEMY_DATABASE_URI").read_text()
    SCHEDULER_JOBSTORES = {"default": SQLAlchemyJobStore(url=SQLALCHEMY_DATABASE_URI)}
    SQLALCHEMY_ECHO = False
    MAIN_LOGGING_LEVEL = INFO
