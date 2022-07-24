from sqlalchemy import Column, Float, String
from sqlalchemy.dialects.postgresql import BYTEA
from db import flask_db


class ApschedulerJobs(flask_db.Model):
    """Various information about jobs in ApScheduler."""

    id = Column(String(191), primary_key=True)
    next_run_time = Column(Float, index=True)
    job_state = Column(BYTEA, nullable=False)
