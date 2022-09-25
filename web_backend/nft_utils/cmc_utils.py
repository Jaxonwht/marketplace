"""
Use CoinMarketCap for NFT related index support
NFT related indexes fall under "cryptocurrencies/token" category
"""
from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json
from utils import *

# Main APIs
def cmc_get_index_latest_price():
    pass

def cmc_get_index_past_prices():
    pass

def cmc_get_index_info():
    pass

def cmc_get_index_24h_volume():
    pass

def cmc_get_index_past_volume():
    pass

def cmc_get_index_past_7d_prices():
    pass

def cmc_get_nft_global_metric_latest():
    pass

def cmc_get_nft_global_metric_historical():
    pass

# Helper Functions
def cmc_request(url, parameters, version='v1'):
    request_url = '{}/{}/{}'.format(CMC_BASE_URL, version, url)
    print(request_url)

    session = Session()
    session.headers.update(CMC_API_HEADER)

    try:
        response = session.get(request_url, params=parameters)
        data = json.loads(response.text)
    except (ConnectionError, Timeout, TooManyRedirects) as e:
        # TODO(Add glogger error)
        data = None
    
    return data

def cmc_get_convert_id_by_name(cmc_convert_name):
    
    return 

def cmc_get_info_by_name(cmc_name):
    url = 'cryptocurrency/info'
    parameters = {
        'symbol': cmc_name
    }
    res = cmc_request(url, parameters)
    json_print(res)
    res_data = res['data'][cmc_name]
    fullname = res_data['name']
    info = {
        'id': res_data['id'], #None nullable
        'name': cmc_name, #None nullable
        'cmc_url': '{}/{}/'.format(CMC_INDEX_URL_BASE, fullname), #None nullable
        'fullname': fullname, #None nullable
        'url': res_data['urls']['website'],
    }
    return info

def cmc_get_info_by_id(cmc_id):
    return
    

if __name__ == "__main__":
    # For testing uses only
    # json_print(cmc_get_convert_id_by_name('BTC'))
    json_print(cmc_get_info_by_name('NFT'))