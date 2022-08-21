"""Calculate the actual profits."""


def profit_for_buyer(
    start_asset_price: float, end_asset_price: float, share_price: float, rate: float, shares: int, multiplier: float
) -> float:
    """
    Calculate the profits FOR THE BUYER. If the result is a negative number,
    that means the buyer suffers a loss.
    """
    diff_ratio = (end_asset_price - start_asset_price) * multiplier / start_asset_price
    if diff_ratio < -rate:
        diff_ratio = -rate
    elif diff_ratio > rate:
        diff_ratio = rate
    return diff_ratio * share_price * shares
