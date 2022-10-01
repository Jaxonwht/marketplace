import json, math
from datetime import datetime, timedelta
import os
from pathlib import Path

# from models.deal_model import Deal

# Enums
# INFO TYPE
TYPE_ASSET = 1
TYPE_COLLECTION = 2
TYPE_INDEX = 3

# Macros
# Opensea Macros
COLLECTION_HEADER = "https://opensea.io/collection/"
ASSET_HEADER = "https://opensea.io/asset/"
OPENSEA_API_HEADER = "https://api.opensea.io/api/v1"
OPENSEA_TESTNET_API_HEADER = "https://testnets-api.opensea.io/api/v1"
# Quicknode Macros
OWNERS_TAIL = "owners?limit=20&order_by=created_date&order_direction=desc"
QUICKNODE_HTTP_PROVIDER = "https://late-floral-frost.discover.quiknode.pro/d4e3fdf60e299990e90e39291a605e86b4cf2ae2/"
QUICKNODE_OPTIONS = {"headers": {"x-qn-api-version": "1"}}
# MNEMONIC Macros
MNEMONIC_API_KEY = os.getenv("MNEMONIC_API_KEY")
if MNEMONIC_API_KEY is None:
    MNEMONIC_API_KEY = (Path("/var") / "MNEMONIC_API_KEY").read_text()

MN_REQ_TRANSFER_HEADER = "https://ethereum.rest.mnemonichq.com/events/v1beta1/transfers/"
MN_REQ_COLLECTION_PRICE_HEADER = "https://ethereum.rest.mnemonichq.com/pricing/v1beta1/prices/by_contract/"
MN_REQ_COLLECTION_VOLUMN_HEADER = "https://ethereum.rest.mnemonichq.com/pricing/v1beta1/volumes/by_contract/"
MN_OFFSET_1 = "DURATION_1_DAY"
MN_OFFSET_7 = "DURATION_7_DAYS"
MN_OFFSET_30 = "DURATION_30_DAYS"
MN_OFFSET_365 = "DURATION_365_DAYS"
MN_OFFSETS = (MN_OFFSET_1, MN_OFFSET_7, MN_OFFSET_30, MN_OFFSET_365)
MN_OFFSET = {1: MN_OFFSET_1, 7: MN_OFFSET_7, 30: MN_OFFSET_30, 365: MN_OFFSET_365}
MN_STEP_15_MIN = "GROUP_BY_PERIOD_15_MINUTES"
MN_STEP_1_HR = "GROUP_BY_PERIOD_1_HOUR"
MN_STEP_1_DAY = "GROUP_BY_PERIOD_1_DAY"
MN_STEPS = (MN_STEP_15_MIN, MN_STEP_1_HR, MN_STEP_1_DAY)
# CoinMarketCap Macros
COINMARKETCAP_API_KEY = os.getenv("COINMARKETCAP_API_KEY")
if COINMARKETCAP_API_KEY is None:
    COINMARKETCAP_API_KEY = (Path("/var") / "COINMARKETCAP_API_KEY").read_text()
CMC_BASE_URL = "https://pro-api.coinmarketcap.com"
CMC_API_HEADER = {
    "Accepts": "application/json",
    "Accept-Encoding": "deflate, gzip",
    "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
}
CMC_INDEX_URL_BASE = "https://coinmarketcap.com/currencies"


def json_print(json_obj):
    if isinstance(json_obj, str):
        json_obj = json.loads(json_obj)
    json_str = json.dumps(json_obj, indent=2)
    print(json_str)


def get_contract_address_from_NFT_url():
    pass


def get_token_id_from_NFT_url():
    pass


def get_collection_url_from_slug(slug):
    return f"{COLLECTION_HEADER}/slug"


def get_slug_from_collection_url(url):
    return url[len(COLLECTION_HEADER) + 1 :]


def wei_to_eth(wei):
    if isinstance(wei, str):
        wei = int(wei, 16)
    eth = float(wei) / 1e18
    return eth


def datetime_to_iso8610(time, with_tz=False):
    if with_tz:
        return time.strftime("%Y-%m-%dT%H:%M:%S.%f%z")
    return time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def iso8610_to_datetime(time_str):
    return datetime.strptime(time_str, "%Y-%m-%dT%H:%M:%S.%f%z")


def time_series_group_by_day(time_arr):
    # TODO(Finish Implementation)
    curr_ts = None
    ndays = math.ceil(curr_ts - time_arr[0] / day_ts)
    new_time_arr = [[], [0] * ndays, [0] * ndays]
    while ndays > 0:
        new_time_arr[0].append(curr_ts - ndays * day_ts)
        ndays -= 1
    new_arr_ptr = 0
    idx = 0
    while idx < len(time_arr):
        pass
    for time, idx in enumerate(time_arr[0]):
        if time < new_time_arr[0][new_arr_ptr]:
            new_time_arr[1][new_arr_ptr] += time_arr[1][idx]
            new_time_arr[2][new_arr_ptr] += time_arr[2][idx]
        else:
            new_arr_ptr += 1


# deal related helper functions
def deal_is_collection(deal):
    return not deal.is_nft_index and deal.asset_id is not None


def deal_is_asset(deal):
    # TODO (Maybe add check to catch no collection_id but asset_id?)
    return not deal.is_nft_index and deal.asset_id is not None


def deal_is_index(deal):
    return deal.is_nft_index
