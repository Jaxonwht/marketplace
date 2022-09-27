import requests
import json
from nft_utils.utils import *


def os_get_single_collection(collection_slug):
    """
    Input:
    * collection_slug str: unique string linked to designated nft collection
    Output:
    * JSON containing collection info
    """
    if not isinstance(collection_slug, str):
        raise Exception(f"collection_slug must be string, got {type(collection_slug)} instead")
    url = f"{OPENSEA_API_HEADER}/collection/{collection_slug}"
    response = requests.get(url)
    res_json = json.loads(response.text)
    return res_json["collection"]


def os_get_single_contrat(contract):
    # TODO(Add this back when API Key is available)
    raise Exception("Under Implementation")
    if not isinstance(contract, str):
        raise Exception(f"collection_slug must be string, got {type(collection_slug)} instead")
    url = f"{OPENSEA_API_HEADER}/asset_contract/{contract}"
    print(url)
    response = requests.get(url)
    # print(response.text)
    res_json = json.loads(response.text)
    return res_json


def os_get_collections():
    pass


def os_get_collection_contract_from_slug():
    pass


def os_get_collection_creation_time():
    pass


def os_get_collection_stats(collection_slug):
    """
    Same as collection['stats']
    Input:
    * collection_slug str: unique string linked to designated nft collection
    Output:
    * JSON containing collection info
    """
    if not isinstance(collection_slug, str):
        raise Exception("collection_slug must be string")
    url = f"{OPENSEA_API_HEADER}/collection/{collection_slug}/stats"
    headers = {"Accept": "application/json"}
    response = requests.get(url, headers)
    res_json = json.loads(response.text)
    return res_json


def os_get_bundles():
    pass


def os_get_owners(asset_contract_address, token_id):
    """Get owners info of an NFT asset
    Currently forbidden without API-key

    Args:
        asset_contract_address (ctr): _description_
        token_id (ctr): _description_

    Returns:
        json: _description_
    """
    url = f"{OPENSEA_API_HEADER}/asset/{asset_contract_address}/{token_id}/{OWNERS_TAIL}"
    response = requests.get(url)
    # print(response.reason)
    res = json.loads(response.text)
    return res


def os_get_single_asset(asset_contract_address, token_id):
    """For Testnet NFTs Only

    Args:
        asset_contract_address (str): unique string linked to designated nft collection
        token_id (str): _description_

    Raises:
        Exception: _description_
        Exception: _description_

    Returns:
        json: _description_
    """

    if not isinstance(asset_contract_address, str):
        raise Exception("asset_contract_address must be string")
    if not isinstance(token_id, str):
        raise Exception("asset_contract_address must be string")
    url = f"{OPENSEA_TESTNET_API_HEADER}/asset/{asset_contract_address}/{token_id}/?include_orders=false"
    # headers = {"Accept": "application/json"}
    # response = requests.get(url, headers)
    response = requests.get(url)
    res_json = json.loads(response.text)
    return res_json


# Testing Use Only
if __name__ == "__main__":
    # collection_slug = "ledger-market-pass-genesis-edition"
    # url = f"{OPENSEA_API_HEADER}/collection/{collection_slug}/activity"
    # response = requests.get(url)
    # res_json = json.loads(response.text)
    # print(res_json)

    asset_contract_address = "0x33c6eec1723b12c46732f7ab41398de45641fa42"
    token_id = "3626"
    res = get_owners(asset_contract_address, token_id)
    print(res)
