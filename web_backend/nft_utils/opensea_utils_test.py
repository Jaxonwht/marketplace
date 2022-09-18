from opensea_utils import *
from quicknode_utils import *
from nft_info import *
import time

def test_os_get_single_collection():
    collection_slug = 'ledger-market-pass-genesis-edition'
    res = os_get_single_collection(collection_slug)
    json_print(res)

def test_os_get_collection_stats():
    collection_slug = 'ledger-market-pass-genesis-edition'
    res = os_get_collection_stats(collection_slug)
    print(res)
    
def test_os_get_owners():
    asset_contract_address = '0x33c6eec1723b12c46732f7ab41398de45641fa42'
    token_id = '5174'
    print(os_get_owners(asset_contract_address, token_id))

def test_os_get_single_asset():
    asset_contract_address = '0x33c6eec1723b12c46732f7ab41398de45641fa42'
    token_id = '5174'
    res = os_get_single_asset(asset_contract_address, token_id)
    print(res)

if __name__ == "__main__":
    ts = time.time()
    # test_get_single_collection()
    # test_get_single_collection_quicknode()
    # test_get_nft_history_prices()
    # test_get_single_nft_info()
    # test_get_transaction_price()
    # test_collection_get_all()
    # test_asset_get_all()
    # test_get_asset_transactions()
    test_get_latest_price()
    print(f"Time spent: {time.time() - ts}")