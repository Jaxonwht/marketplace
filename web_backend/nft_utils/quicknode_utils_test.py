from opensea_utils import *
from quicknode_utils import *
from nft_info import *
import time

def test_get_single_collection():
    fetcher = QuicknodeFetcher()
    asset_contract_address = '0x33c6eec1723b12c46732f7ab41398de45641fa42'
    json_print(fetcher.get_single_collection(asset_contract_address))
    
def test_get_single_nft_info():
    fetcher = QuicknodeFetcher()
    # asset_contract_address = '0x33c6eec1723b12c46732f7ab41398de45641fa42'
    # token_id = '5174'
    asset_contract_address = '0x39ee2c7b3cb80254225884ca001F57118C8f21B6'
    token_id = '4812'
    # asset_contract_address = "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"
    # token_id = '1828'
    fetcher.get_single_nft_info(asset_contract_address, token_id)
    
def test_get_transaction_price():
    # tx_hash = "0x124a0b68ca9e7943067bb98b7c306db15b528799861510240a893c8a0532a192"
    # tx_hash = "0x9e46ceb3f583b55103dd9453434734d6028c62187109ab1bd3ab622572ba981c"
    # tx_hash = "0x3b7965add5b86240ebc050d526301ff2874c8f6e1b4e570b0197cc839fdc3feb"
    # tx_hash = "0xbe5523797d9728f1b805dafada62b3d56d20129111f97cb18dada85cb330a3dc"
    # tx_hash = "0x87d0c0ddf7ea29b47f1f3a174cc81319fa74f2e32ab3950541cf6cd630fc95d3"
    # tx_hash = "0x111476d36e45c5303bd418735c1243d108872ca622485aaedc39272fa173f585"
    fetcher = QuicknodeFetcher()
    tx_hash = "0xb458bafb72d6b265685dd494c5ed0fe0aeb34ee7b3683711eac476c68599c094"
    print(qn_get_transaction_price(fetcher.w3, tx_hash))
    
def test_asset_get_all():
    collection_slug = 'ledger-market-pass-genesis-edition'
    token_id = '5174'
    nft_info = NFTInfo(collection_slug, token_id)
    json_print(nft_info.get_info_json())
    
def test_collection_get_all():
    collection_slug = 'ledger-market-pass-genesis-edition'
    nft_info = NFTInfo(collection_slug)
    json_print(nft_info.get_info_json())
    
def test_get_asset_transactions():
    # collection_slug = 'ledger-market-pass-genesis-edition'
    collection_slug = 'otherdeed'
    # token_id = '5174'
    token_id = '73969'
    nft_info = NFTInfo(TYPE_ASSET, collection_slug, token_id)
    print(nft_info.get_asset_transaction_history())
    
def test_get_latest_price():
    collection_slug = 'ledger-market-pass-genesis-edition'
    # token_id = '5174'
    token_id = '1192'
    collection_info = NFTInfo(collection_slug)
    asset_info = NFTInfo(collection_slug, token_id)
    print(collection_info.get_latest_price())
    print(asset_info.get_latest_price())
    
def test_get_collection_name_from_address():
    contract = "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258"
    qn_get_collection_name_from_contract(contract)

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
    # test_get_latest_price()
    test_get_collection_name_from_address()
    print(f"Time spent: {time.time() - ts}")