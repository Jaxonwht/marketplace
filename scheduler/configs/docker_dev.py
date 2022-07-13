"""Development config specifically for a docker environment."""

from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from configs.base import Config


class DockerDevelopmentConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used during development."""

    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@db:5432/local_db"
    SCHEDULER_JOBSTORES = {"default": SQLAlchemyJobStore(url=SQLALCHEMY_DATABASE_URI)}
