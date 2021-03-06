"""Production config."""
from typing import Dict
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from pathlib import Path
from logging import INFO
from configs.base import Config


class ProductionConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used during production."""

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate the database uri from secret file"""
        return (Path("/var") / "SQLALCHEMY_DATABASE_URI").read_text()

    @property
    def SCHEDULER_JOBSTORES(self) -> Dict:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate jobstores"""
        return {"default": SQLAlchemyJobStore(url=self.SQLALCHEMY_DATABASE_URI)}

    @property
    def PERPETUAL_SCHEDULER_TOKEN(self) -> str:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate perpetual token to access web backend"""
        return (Path("/var") / "PERPETUAL_SCHEDULER_TOKEN").read_text()

    SQLALCHEMY_ECHO = False
    MAIN_LOGGING_LEVEL = INFO
    WEB_BACKEND_URL = "http://client-service-prod/api"
