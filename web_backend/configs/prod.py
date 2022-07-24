"""Production config."""
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
    def ADMIN_PASSWORD(self) -> str:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate the admin password from secret file"""
        return (Path("/var") / "ADMIN_PASSWORD").read_text()

    @property
    def JWT_SECRET_KEY(self) -> bytes:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate the jwt secret key from secret file"""
        return bytes.fromhex((Path("/var") / "JWT_SECRET_KEY").read_text())

    SQLALCHEMY_ECHO = False
    MAIN_LOGGING_LEVEL = INFO
    SCHEDULER_URL = "http://scheduler-service-prod:4000"
    JWT_COOKIE_SECURE = True
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
