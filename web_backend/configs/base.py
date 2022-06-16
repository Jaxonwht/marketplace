"""Base config."""


class Config:  # pylint: disable=too-few-public-methods
    """Base configuration shared by all configs."""

    ENV = "development"
    TESTING = False
    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@localhost:5432/local_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
