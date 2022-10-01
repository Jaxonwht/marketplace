"""
Use CoinMarketCap for NFT related index support
NFT related indexes fall under "cryptocurrencies/token" category
All indexes can be specified either by convert_name or convert_id
To avoid confusion, all requests are contructed based on convert_id
"""
from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json, random, datetime
from nft_utils.utils import *

# Main APIs
def cmc_get_index_latest_price(cmc_id):
    url = "cryptocurrency/quotes/latest"
    version = "v2"
    parameters = {
        "id": cmc_id
    }
    res = cmc_request(url, parameters, version)
    latest_price = res["data"][str(cmc_id)]["quote"]["USD"]["price"]
    return latest_price


def cmc_get_index_past_prices(cmc_id, step, count):
    pass


def cmc_get_index_info(cmc_id):
    return cmc_get_index_info_by_id(cmc_id)


def cmc_get_index_24h_volume(cmc_id):
    url = "cryptocurrency/quotes/latest"
    version = "v2"
    parameters = {
        "id": cmc_id
    }
    res = cmc_request(url, parameters, version)
    volume_24h = res["data"][str(cmc_id)]["quote"]["USD"]["volume_24h"]
    return volume_24h


def cmc_get_index_past_volume(cmc_id):
    # Pending: not sure of correctness
    url = "cryptocurrency/quotes/latest"
    version = "v2"
    parameters = {
        "id": cmc_id
    }
    res = cmc_request(url, parameters, version)
    volume_24h = res["data"][str(cmc_id)]["quote"]["USD"]["volume_24h"]
    latest_ts = res["data"][str(cmc_id)]["quote"]["USD"]["last_updated"]
    volumes = [[latest_ts]*5, [volume_24h]*5]
    time = iso8610_to_datetime(latest_ts)
    times = [
        datetime_to_iso8610(time + timedelta(days=-30)),
        datetime_to_iso8610(time + timedelta(days=-7)),
        datetime_to_iso8610(time + timedelta(days=-1)),
        datetime_to_iso8610(time + timedelta(hours=-1))
    ]
    volume_changes = [
        res["data"][str(cmc_id)]["quote"]["USD"]["percent_change_30d"]/100,
        res["data"][str(cmc_id)]["quote"]["USD"]["percent_change_7d"]/100,
        res["data"][str(cmc_id)]["quote"]["USD"]["percent_change_24h"]/100,
        res["data"][str(cmc_id)]["quote"]["USD"]["percent_change_1h"]/100
    ]
    print(volume_changes)
    for i in range(4):
        volumes[0][i] = times[i]
        volumes[1][i] = volume_24h * (1 + volume_changes[i])
    return volumes


def cmc_get_index_past_nday_prices(cmc_id, ndays=7):
    # (TODO: Replace with a real one)
    url = "cryptocurrency/quotes/latest"
    version = "v2"
    parameters = {
        "id": cmc_id
    }
    res = cmc_request(url, parameters, version)
    latest_price = res["data"][str(cmc_id)]["quote"]["USD"]["price"]
    latest_ts = res["data"][str(cmc_id)]["quote"]["USD"]["last_updated"]
    prices = [[latest_ts]*7, [latest_price]*7]
    i = 5
    while i >= 0:
        time = iso8610_to_datetime(prices[0][i+1])
        prices[0][i] = datetime_to_iso8610(time + timedelta(days=-1))
        prices[1][i] = prices[1][i+1] * (1 + random.uniform(-0.2, 0.2))
        i -= 1
    return prices

def cmc_get_index_past_nday_volume(cmc_id, ndays=7):
    # (TODO: Replace with a real one)
    url = "cryptocurrency/quotes/latest"
    version = "v2"
    parameters = {
        "id": cmc_id
    }
    res = cmc_request(url, parameters, version)
    volume_24h = res["data"][str(cmc_id)]["quote"]["USD"]["volume_24h"]
    latest_ts = res["data"][str(cmc_id)]["quote"]["USD"]["last_updated"]
    volumes = [[latest_ts]*7, [volume_24h]*7]
    i = 5
    while i >= 0:
        time = iso8610_to_datetime(volumes[0][i+1])
        volumes[0][i] = datetime_to_iso8610(time + timedelta(days=-1))
        volumes[1][i] = volumes[1][i+1] * (1 + random.uniform(-0.05, 0))
        i -= 1
    return volumes


def cmc_get_nft_global_metric_latest(cmc_id):
    pass


def cmc_get_nft_global_metric_historical(cmc_id):
    pass


# Helper Functions
def cmc_request(url, parameters, version="v1"):
    request_url = "{}/{}/{}".format(CMC_BASE_URL, version, url)

    session = Session()
    session.headers.update(CMC_API_HEADER)

    try:
        response = session.get(request_url, params=parameters)
        data = json.loads(response.text)
    except (ConnectionError, Timeout, TooManyRedirects) as e:
        # TODO(Add glogger error)
        raise Exception("CMC Request Failed")

    return data


def cmc_get_convert_id_by_name(cmc_convert_name):
    return


def cmc_get_index_info_by_name(cmc_name):
    url = "cryptocurrency/info"
    parameters = {"symbol": cmc_name}
    res = cmc_request(url, parameters)
    res_data = res["data"][cmc_name]
    fullname = res_data["name"]
    info = {
        "id": res_data["id"],  # None nullable
        "name": cmc_name,  # None nullable
        "cmc_url": "{}/{}/".format(CMC_INDEX_URL_BASE, fullname),  # None nullable
        "fullname": fullname,  # None nullable
        "url": res_data["urls"]["website"],
    }
    return info


def cmc_get_index_info_by_id(cmc_id):
    url = "cryptocurrency/info"
    parameters = {"id": cmc_id}
    res = cmc_request(url, parameters)
    res_data = res["data"][str(cmc_id)]
    fullname = res_data["name"]
    info = {
        "id": cmc_id,  # None nullable
        "name": res_data['symbol'],  # None nullable
        "cmc_url": "{}/{}/".format(CMC_INDEX_URL_BASE, fullname),  # None nullable
        "fullname": fullname,  # None nullable
        "url": res_data["urls"]["website"],
    }
    return info


if __name__ == "__main__":
    # For testing uses only
    # json_print(cmc_get_convert_id_by_name('BTC'))
    # json_print(cmc_get_index_info_by_name("NFT"))
    # res = cmc_get_index_latest_price(9816)
    # print(res, type(res))
    # print(cmc_get_index_past_nday_prices(9816))
    # print(cmc_get_index_info_by_id(9816))
    # print(cmc_get_index_past_nday_volume(9816))
    print(cmc_get_index_past_volume(9816))
