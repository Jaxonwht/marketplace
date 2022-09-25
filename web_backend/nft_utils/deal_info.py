from gc import collect
from re import L
from typing import ParamSpecArgs
from nft_utils.mnemonic_utils import *
from utils import *
from nft_utils.opensea_utils import *
from nft_utils.quicknode_utils import *
from models.deal_model import Deal

# Abstraction on deal level
def get_deal_info(deal):
    if deal_is_collection(deal):
        return get_info(
            TYPE_COLLECTION,
            deal.collection_id,
            deal.extra_info
        )
    if deal_is_asset(deal):
        return get_info(
            TYPE_ASSET,
            deal.collection_id,
            deal.asset_id,
            deal.extra_info
        )
    return get_info(TYPE_INDEX, deal.extra_info)

def get_deal_info_with_ids(contract, token_id):
    if token_id is not None:
        return get_info_asset(contract, token_id)
    return get_info_collection(contract)

def get_deal_prices_history(deal):
    if deal_is_collection(deal):
        return get_prices_history(
            TYPE_COLLECTION,
            deal.collection_id,
            deal.extra_info
        )
    if deal_is_asset(deal):
        return get_prices_history(
            TYPE_ASSET,
            deal.collection_id,
            deal.asset_id,
            deal.extra_info
        )
    return get_prices_history(TYPE_INDEX, deal.extra_info)

def get_deal_current_price(deal):
    if deal_is_collection(deal):
        return get_current_price(
            TYPE_COLLECTION,
            deal.collection_id,
            deal.extra_info
        )
    if deal_is_asset(deal):
        return get_current_price(
            TYPE_ASSET,
            deal.collection_id,
            deal.asset_id,
            deal.extra_info
        )
    return get_current_price(TYPE_INDEX, deal.extra_info)

def get_deal_sales_volume(deal):
    if deal_is_collection(deal):
        return get_sales_volume(
            TYPE_COLLECTION,
            deal.collection_id,
            deal.extra_info
        )
    if deal_is_asset(deal):
        return get_sales_volume(
            TYPE_ASSET,
            deal.collection_id,
            deal.asset_id,
            deal.extra_info
        )
    return get_sales_volume(TYPE_INDEX, deal.extra_info)

# Main Functions
def get_info(type, contract, token_id=None, extra_info=None):
    if type == TYPE_ASSET:
        return get_info_asset(contract, token_id)
    elif type == TYPE_COLLECTION:
        return get_info_collection(contract)
    return get_info_index(extra_info)

def get_info_collection(contract):
    slug = get_collection_slug(contract)
    collection_info_raw = os_get_single_collection(slug)
    json_print(collection_info_raw)
    info = {}
    # Required Fields
    info['collection_name'] = slug
    info['contract'] = collection_info_raw['primary_asset_contracts'][0]['address']
    info['create_date'] = collection_info_raw['created_date']
    info['description'] = collection_info_raw['description']
    info['floor_price'] = collection_info_raw['stats']['floor_price']
    info['image_url'] = collection_info_raw['image_url']
    info['opensea_url'] = f'{COLLECTION_HEADER}/{slug}'
    # Optional Fields
    info['external_url'] = collection_info_raw['external_url']
    return info
    

def get_info_asset(contract, token_id):
    slug = get_collection_slug(contract)
    collection_info_raw = os_get_single_collection(slug)
    json_print(collection_info_raw)
    info = {}
    # Required Fields
    info['collection_name'] = slug
    info['contract'] = collection_info_raw['primary_asset_contracts'][0]['address']
    info['create_date'] = collection_info_raw['created_date']
    info['description'] = collection_info_raw['description']
    info['floor_price'] = collection_info_raw['stats']['floor_price']
    info['image_url'] = collection_info_raw['image_url']
    # TODO(Add potential support for solana)
    info['opensea_url'] = f'{ASSET_HEADER}/ethereum/{contract}/{token_id}'
    # Optional Fields
    info['external_url'] = collection_info_raw['external_url']
    return info

def get_info_index(index_metadata):
    # TODO(Add support later)
    return index_metadata

def get_prices_history(type, contract, token_id=None, extra_info=None):
    if type == TYPE_ASSET:
        return get_prices_history_asset(contract, token_id)
    elif type == TYPE_COLLECTION:
        return get_prices_history_collection(contract)
    return get_prices_history_index(extra_info)

def get_prices_history_collection(contract):
    # TODO(Add support for variable collection price date range)
    res = mn_get_collection_latest_avg_prices_by_day(contract, 7)
    return res

def get_prices_history_asset(contract, token_id):
    # TODO(Add support for latest n transactions)
    res = mn_get_asset_transactions(contract, token_id, ascending=True)
    return res

def get_prices_history_index(index_metadata):
    raise Exception("Not Implemented")

def get_current_price(type, contract, token_id=None, extra_info=None):
    if type == TYPE_ASSET:
        return get_current_price_asset(contract, token_id)
    elif type == TYPE_COLLECTION:
        return get_current_price_collection(contract)
    return get_current_price_index(extra_info)

def get_current_price_collection(contract):
    # Avg transaction prices of the whole collection in the latest 1-day
    res = mn_get_collection_latest_1day_avg_price(contract)
    return res

def get_current_price_asset(contract, token_id):
    # Latest Transaction price of the asset
    res = mn_get_asset_latest_price(contract, token_id)
    return res

def get_current_price_index():
    raise Exception("Not Implemented")

def get_sales_volume(type, contract, token_id=None, extra_info=None):
    if type == TYPE_INDEX:
        raise Exception("Index has no sales volume")
    if type == TYPE_ASSET:
        return get_sales_volume_asset(contract, token_id)
    return get_sales_volume_collection(contract)

def get_sales_volume_collection(contract):
    # TODO(Add support for variable date range and step length)
    return mn_get_collection_sales_volume_by_day(contract, 7)

def get_sales_volume_asset():
    pass

# Additional Helpers
def get_url(type, contract, token_id):
    if type == TYPE_INDEX:
        # TODO(Finish index implementations)
        return None
    info = get_info(type, contract, token_id)
    return info['opensea_url']

def get_image_url(type, contract, token_id):
    if type == TYPE_INDEX:
        # TODO(Finish index implementations)
        return None
    info = get_info(type, contract, token_id)
    return info['image_url']

def get_nft_creation_time():
    if type == TYPE_INDEX:
        # TODO(Finish index implementations)
        return None
    info = get_info(type, contract, token_id)
    return info['created_date']

def get_collection_contract(slug):
    res = os_get_single_collection(slug)
    return res['primary_asset_contracts'][0]['address']

def get_collection_slug(contract):
    # TODO(Implement try-catch to use os api when qn fails)
    res = qn_get_collection_info(contract)
    # res = os_get_single_contrat(contract)
    return res['result'][0]['name'].lower()

if __name__ == "__main__":
    slug = "otherdeed"
    contract = "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258"
    # contract = "0x06012c8cf97bead5deae237070f9587f8e7a266d"
    token_id = '73969'
    # print(get_collection_slug(contract))
    # get_collection_contract(slug)
    get_info_collection(contract)
