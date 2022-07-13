"""Actual wsgi endpoint for the flask app."""
from app import create_app

scheduler_app = create_app()
