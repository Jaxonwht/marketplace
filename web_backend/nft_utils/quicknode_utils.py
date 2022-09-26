from web3 import Web3, HTTPProvider
import pickle, json
from hexbytes import HexBytes
from nft_utils.utils import *


class HexJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, HexBytes):
            return obj.hex()
        return super().default(obj)


def qn_get_transactions(start, end, address, w3=None):
    if w3 is None:
        w3 = Web3(HTTPProvider(QUICKNODE_HTTP_PROVIDER, QUICKNODE_OPTIONS))
    transactions_map = {}
    for x in range(start, end):
        block = w3.eth.getBlock(x, True)
        for transaction in block.transactions:
            if transaction["to"] == address or transaction["from"] == address:
                print(f"Found at block: {x}")
                hash_str = transaction["hash"].hex()
                transactions_map[hash_str] = transaction
    print(f"Finished searching blocks {start} through {end} and found {len(transactions_map)} transactions")
    return transactions_map


def qn_get_transactions_with_file(start, end, address, file_path=None, w3=None):
    if w3 is None:
        w3 = Web3(HTTPProvider(QUICKNODE_HTTP_PROVIDER, QUICKNODE_OPTIONS))
    transactions_map = {}
    for x in range(start, end):
        block = w3.eth.getBlock(x, True)
        for transaction in block.transactions:
            if transaction["to"] == address or transaction["from"] == address:
                if file_path is None:
                    file_path = "transactions.pkl"
                with open(file_path, "wb") as f:
                    hashStr = transaction["hash"].hex()
                    transactions_map[hashStr] = transaction
                    pickle.dump(transactions_map, f)
                f.close()
    return transactions_map


def qn_get_transaction_price(tx_hash, w3=None):
    if w3 is None:
        w3 = Web3(HTTPProvider(QUICKNODE_HTTP_PROVIDER, QUICKNODE_OPTIONS))
    tx_hex = w3.eth.get_transaction(tx_hash)
    price_wei = tx_hex.value
    return wei_to_eth(price_wei)


def qn_get_collection_name_from_contract(contract):
    w3 = Web3(HTTPProvider(QUICKNODE_HTTP_PROVIDER, QUICKNODE_OPTIONS))
    resp = w3.provider.make_request("qn_getTokenMetadataByContractAddress", {"contract": contract})
    #  json_print(resp)


def qn_get_collection_info(contract):
    w3 = Web3(HTTPProvider(QUICKNODE_HTTP_PROVIDER))
    response = w3.provider.make_request("qn_fetchNFTCollectionDetails", {"contracts": [contract]})
    return response


class QuicknodeFetcher:
    def __init__(self, w3=None):
        if w3 is None:
            w3 = Web3(HTTPProvider(QUICKNODE_HTTP_PROVIDER, QUICKNODE_OPTIONS))
        self.w3 = w3

    def get_single_collection(self, contract):
        w3 = Web3(HTTPProvider(QUICKNODE_HTTP_PROVIDER))
        response = w3.provider.make_request("qn_fetchNFTCollectionDetails", {"contracts": [contract]})
        return response

    def check_nft_owner(self, wallet, collection_contract_address, token_id):
        raise Exception("not implemented yet")

    def get_single_nft_info(self, collection_contract_address, token_id):
        request = {}
        request["collection"] = collection_contract_address
        request["tokens"] = [token_id]
        # "omitFields": []
        # "page": 1,
        # "perPage": 10
        resp = self.w3.provider.make_request("qn_fetchNFTsByCollection", request)
        return resp

    def get_multi_nfts_info(self, contracts):
        raise Exception("not implemented yet")

    def get_nft_history_prices_from_chain(self, address, block=None, max_blocks_offset=100):
        if block is None:
            block = self.w3.eth.blockNumber
        ending_blocknumber = block + max_blocks_offset
        satrting_blocknumber = ending_blocknumber - max_blocks_offset
        if not isinstance(address, str):
            raise Exception("address should be str")
        transactions_map = qn_get_transactions(self.w3, satrting_blocknumber, ending_blocknumber, address)
