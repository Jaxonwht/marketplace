"""
APScheduler initialization.
"""

from pytz import utc

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor


jobstores = {"default": SQLAlchemyJobStore(url="sqlite:///jobs.sqlite")}
executors = {
    "default": ThreadPoolExecutor(20),
}
job_defaults = {"max_instances": 3}


if __name__ == "__main__":
    scheduler = BlockingScheduler()
    scheduler.configure(jobstores=jobstores, executors=executors, job_defaults=job_defaults, timezone=utc)
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass
