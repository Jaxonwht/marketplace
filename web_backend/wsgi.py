"""Actual wsgi endpoint for the flask app."""
from app import create_app

web_backend_app = create_app()
