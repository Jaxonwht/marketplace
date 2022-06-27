"""Initialize sqlalchemy."""
from sqlalchemy.orm import Session
from flask_sqlalchemy import SQLAlchemy

flask_db = SQLAlchemy()
flask_session: Session = flask_db.session
