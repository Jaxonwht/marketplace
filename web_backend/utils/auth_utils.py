"""Contains various code about authentication and authorization"""
import os
from hashlib import pbkdf2_hmac
from typing import Tuple


def salted_hash(password: str, hash_iterations: int) -> Tuple[bytes, bytes]:
    """
    Returns a tuple of [password_hash, salt] to the caller using the sha256 cryptographic hash.
    """
    salt = os.urandom(16)
    password_hash = pbkdf2_hmac("sha256", password.encode("utf-8"), salt, hash_iterations)
    return password_hash, salt
