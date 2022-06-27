from sqlalchemy import Column, Integer
from db import flask_db


class Counter(flask_db.Model):
    number = Column(Integer, primary_key=True)
