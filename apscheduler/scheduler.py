"""
APScheduler initialization.
"""

import os
import importlib
from sqlalchemy import MetaData, create_engine
from sqlalchemy.schema import CreateSchema
from pytz import utc

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor

_SCHEDULER_CONFIG = os.getenv("SCHEDULER_CONFIG", "Config")
_CONFIG_CLASS = getattr(importlib.import_module("configs"), _SCHEDULER_CONFIG)
_DATABASE_URI = _CONFIG_CLASS.SQLALCHEMY_DATABASE_URI
_SCHEDULER_SCHEMA = "scheduler"

engine = create_engine(_DATABASE_URI)

try:
    with engine.connect() as conn:
        conn.execute(CreateSchema(_SCHEDULER_SCHEMA))
except Exception:
    print(f"Schema {_SCHEDULER_SCHEMA} already exists")

_JOBSTORES = {"default": SQLAlchemyJobStore(url=_DATABASE_URI, metadata=MetaData(schema=_SCHEDULER_SCHEMA))}
_EXECUTORS = {
    "default": ThreadPoolExecutor(5),
}
_JOB_DEFAULTS = {"max_instances": 3}


def job() -> None:
    raise Exception("Oh no")


if __name__ == "__main__":
    scheduler = BlockingScheduler()
    scheduler.configure(jobstores=_JOBSTORES, executors=_EXECUTORS, job_defaults=_JOB_DEFAULTS, timezone=utc)
    scheduler.add_job(job, "interval", seconds=1)
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass
