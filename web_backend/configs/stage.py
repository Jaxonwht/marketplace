"""Development config."""

from configs.base import Config


class StagingConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used in staging environments."""

    SQLALCHEMY_ECHO = False
