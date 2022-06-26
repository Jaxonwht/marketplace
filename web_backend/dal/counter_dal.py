"""DAL for counter related things."""
from typing import Optional
from sqlalchemy import select
from db import flask_db
from models.counter_model import Counter


def get_current_counter() -> Optional[Counter]:
    statement = select(Counter)
    return flask_db.session.scalar(statement)


def initialize_counter_to_zero() -> None:
    current_counter = get_current_counter()
    if not current_counter:
        flask_db.session.add(Counter(number=0))
    else:
        current_counter.number = 0
    flask_db.session.commit()


def change_counter(change: int) -> Optional[Counter]:
    existing_counter = flask_db.session.scalar(select(Counter))
    if existing_counter:
        existing_counter.number += change
        flask_db.session.commit()
        return existing_counter
    return None
