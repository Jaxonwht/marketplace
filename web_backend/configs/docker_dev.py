"""Development config specifically for a docker environment."""

from configs.base import Config


class DockerDevelopmentConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used during development."""

    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@db:5432/local_db"
    SCHEDULER_URL = "http://scheduler:4000"
