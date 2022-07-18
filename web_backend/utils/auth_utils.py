"""Contains various code about authentication and authorization"""
import os
from hashlib import pbkdf2_hmac
from typing import Tuple


_HASH_ALGORITHM = "sha256"


def salted_hash(password: str, hash_iterations: int) -> Tuple[bytes, bytes]:
    """
    Returns a tuple of [password_hash, salt] to the caller using the sha256 cryptographic hash.
    """
    salt = os.urandom(16)
    password_hash = pbkdf2_hmac(_HASH_ALGORITHM, password.encode("utf-8"), salt, hash_iterations)
    return password_hash, salt


def verify_password(password: str, password_hash: bytes, salt: bytes, hash_iterations: int) -> bool:
    """
    Verify that the password does match the stored password hash with the same salt and the
    same number of hash iterations.
    """
    new_hash = pbkdf2_hmac(_HASH_ALGORITHM, password.encode("utf-8"), salt, hash_iterations)
    return new_hash == password_hash
