from inspect import iscode
from utils import *
from opensea_utils import *
from quicknode_utils import *


class NFTInfo:
    def __init__(self, type, collection_slug=None, token_id=None, collection_contract=None, index_setup=None):
        if type == TYPE_INDEX:
            # TODO(placeholder for index related APIs)
            self.index_setup = index_setup
            return
        assert isinstance(collection_slug, str)
        if token_id is not None:
            assert isinstance(token_id, str)
        if collection_contract is not None:
            assert isinstance(collection_contract, str)
        # if collection_slug is None and collection_contract is None:
        #     raise Exception("Collection slug and collection contract cannot both be Null")
        self.collection_slug = collection_slug
        self.contract = collection_contract
        self.token_id = token_id
        self.type = type
        self.fetcher = QuicknodeFetcher()
        self.fetch_info()

    def fetch_info(self):
        self.info = {}
        if self.type is TYPE_INDEX:
            # TODO(Placeholder for index info)
            return

        # Asset needs collection info
        self.get_collection_info()
        if self.type is TYPE_ASSET:
            self.get_asset_info()

    def get_collection_info(self):
        if self.type is TYPE_INDEX:
            raise Exception("Index Object type cannot fetch collection info")
        info = os_get_single_collection(self.collection_slug)
        json_print(info)
        self.contract = info["primary_asset_contracts"][0]["address"]
        self.info["description"] = info["description"]
        self.info["collection_image_url"] = info["image_url"]
        try:
            self.info["collection_name"] = info["name"]
        except:
            self.info["collection_name"] = info["primary_asset_contracts"][0]["name"]
        price_stats = info["stats"]
        self.floor_price = price_stats["floor_price"]
        self.info["collection_price"] = {
            "1day": price_stats["one_day_average_price"],
            "7day": price_stats["seven_day_average_price"],
            "30day": price_stats["thirty_day_average_price"],
            "alltime": price_stats["average_price"],
        }
        self.info["collection_volume"] = {
            "1day": price_stats["one_day_volume"],
            "7day": price_stats["seven_day_volume"],
            "30day": price_stats["thirty_day_volume"],
            "alltime": price_stats["total_volume"],
        }
        self.info["collection_sales"] = {
            "1day": price_stats["one_day_sales"],
            "7day": price_stats["seven_day_sales"],
            "30day": price_stats["thirty_day_sales"],
            "alltime": price_stats["total_sales"],
        }

    def get_asset_info(self):
        if self.type is not TYPE_ASSET:
            raise Exception("Fetching asset info but got wrong type")
        print(self.contract)
        print(self.token_id)
        # info = self.fetcher.get_single_nft_info(self.contract, self.token_id)['result']['tokens'][0]
        info = self.fetcher.get_single_nft_info(self.contract, self.token_id)
        json_print(info)
        self.info["asset_name"] = info["name"]
        self.info["asset_image_url"] = info["imageUrl"]
        try:
            self.info["owner"] = info["currentOwner"]
        except:
            # TODO(Add logging for missing info field)
            pass
        self.transactions = []
        for event in info["provenance"]:
            time = event["date"]
            tx_hash = event["txHash"]
            price = qn_get_transaction_price(tx_hash, self.fetcher.w3)
            self.transactions.append({"time": time, "price": price})
        self.transactions.sort(key=lambda x: x["time"])

    def get_collection_name(self):
        return self.info["collection_name"]

    def get_asset_name(self):
        return self.info["asset_name"]

    def get_collection_description(self):
        return self.info["collection_description"]

    def get_asset_owner(self):
        return self.info["owner"]

    def get_opensea_url(self):
        if self.ISCOLLECTION:
            return f"{COLLECTION_HEADER}/{self.collection_slug}"
        return f"{ASSET_HEADER}/{self.contract}/{self.token_id}"

    def get_image_url(self):
        if self.ISCOLLECTION:
            return self.info["collection_image_url"]
        return self.info["asset_image_url"]

    def get_creater(self):
        raise Exception("Not implemented")

    def get_price_history(self):
        """Exposed API for getting object price history

        Returns:
            list: 2-d array for time series, list[0] is time and list[1] is price
        """
        if self.type is TYPE_COLLECTION:
            return self.get_collection_price_history()
        elif self.type is TYPE_ASSET:
            return self.get_asset_transaction_history()
        else:
            # TODO(placeholder for index)
            pass

    # TODO(Tranverse all assets and aggregate avg price per day)
    def get_collection_price_history(self):
        if self.type is not TYPE_COLLECTION:
            raise Exception("Accessing collection history but got wrong type")

        return self.info["collection_price"]

    def get_asset_transaction_history(self):
        if self.type is not TYPE_ASSET:
            raise Exception("Accessing asset history but got wrong type")
        return self.transactions

    def get_index_price_history(self):
        if self.type is not TYPE_INDEX:
            raise Exception("Accessing index history but got wrong type")
        # TODO(Placeholder for index)
        pass

    def get_latest_price(self):
        """Exposed API for getting object latest price

        Returns:
            string: latest price for either asset, collection, or index
        """
        if self.type is TYPE_ASSET:
            return self.get_latest_asset_price()
        elif self.type is TYPE_COLLECTION:
            return self.get_latest_collection_avg_price()
        else:
            return self.get_latest_index_price()

    def get_latest_collection_avg_price(self):
        return self.info["collection_price"]["1day"]

    def get_latest_asset_price(self):
        return self.transactions[-1]["price"]

    def get_latest_index_price(self):
        # TODO(Placeholder for index)
        pass

    def get_info_json(self):
        """Exposed API for get object information

        Returns:
            json: json struct containing all related info
        """
        info_json = json.dumps(self.info)
        return info_json
