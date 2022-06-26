from db import flask_db


class Counter(flask_db.Model):
    number: int = flask_db.Column(flask_db.Integer, primary_key=True)
