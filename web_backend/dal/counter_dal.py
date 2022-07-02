"""DAL for counter related things."""
from typing import Optional
from sqlalchemy import select
from models.counter_model import Counter
from db import flask_session


def get_current_counter() -> Optional[Counter]:
    return flask_session.scalar(select(Counter))


def initialize_counter_to_zero() -> None:
    current_counter: Optional[Counter] = flask_session.scalar(select(Counter).with_for_update())
    if not current_counter:
        flask_session.add(Counter(number=0))
    else:
        current_counter.number = 0
    flask_session.commit()


def change_counter(change: int) -> Optional[Counter]:
    existing_counter = flask_session.scalar(select(Counter).with_for_update())
    if existing_counter:
        existing_counter.number = Counter.number + change
        flask_session.commit()
        return existing_counter
    return None
