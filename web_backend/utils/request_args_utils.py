def value_is_true(value: str) -> bool:
    """Request args boolean parameters are always strings actually."""
    return value.lower() == "true"
