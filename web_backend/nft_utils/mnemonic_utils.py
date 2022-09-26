import requests
from utils import *


def mn_get_asset_raw_transactions(contract, token_id, ascending=True):
    """_summary_

    Args:
        contract (_type_): _description_
        token_id (_type_): _description_
        ascending (bool, optional): _description_. Defaults to True.

    Returns:
        _type_: _description_
    """
    # 500 rows maximum in request
    contract_address = contract
    token_id = token_id
    url = MN_REQ_TRANSFER_HEADER + contract_address + "/" + token_id
    sortDirection = "SORT_DIRECTION_ASC" if ascending else "SORT_DIRECTION_DESC"

    query = {
        "limit": "500",
        "offset": "0",
        "sortDirection": sortDirection,
        "blockTimestampGt": "2019-08-24T14:15:22Z",
        "transferTypes": "TRANSFER_TYPE_REGULAR",
    }

    headers = {"X-API-Key": MN_API_KEY}

    response = requests.get(url, headers=headers, params=query)

    data = response.json()
    # TODO(Add alert when response length reaches 500 limit)
    return data["transfers"]


def mn_get_asset_raw_transactions_forward(contract, token_id):
    return mn_get_asset_raw_transactions(contract, token_id, True)


def mn_get_asset_raw_transactions_backward(contract, token_id):
    return mn_get_asset_raw_transactions(contract, token_id, False)


def mn_get_asset_transactions(contract, token_id, ascending=True):
    # 500 rows maximum in request
    raw_txs = mn_get_asset_raw_transactions(contract, token_id, ascending)

    # TODO(Add GLog INFO when response length reaches 500 limit)
    txs = [[], []]
    for trans in raw_txs:
        txs[0].append(trans["blockTimestamp"])
        txs[1].append(float(trans["txValue"]["decimalValue"]))
        # print(f"TS: {trans['blockTimestamp']}")
        # print(f"txValue: {trans['txValue']['decimalValue']}")
        # print("---"* 5)
    return txs


def mn_get_asset_sales_volume(contract, token_id, ascending=True):
    raw_txs = mn_get_asset_raw_transactions(contract, token_id, ascending)
    sales = [[], []]
    cnt = 0
    for trans in raw_txs:
        sales[0].append(trans["blockTimestamp"])
        sales[1].append(cnt)
        cnt += 1
    return sales


def mn_get_asset_latest_price(contract, token_id):
    raw_txs = mn_get_asset_raw_transactions(contract, token_id, ascending=False)
    return raw_txs[0]["txValue"]["decimalValue"]


def mn_get_asset_latest_sale_time(contract, token_id):
    raw_txs = mn_get_asset_raw_transactions(contract, token_id, ascending=False)
    return raw_txs[0]["blockTimestamp"]


def mn_get_collection_avg_prices(contract, offset, step, ts=None):
    """get collection average price
    Average price started by `offset` days from specified `ts`,
    group by `step` (non-cumulative)

    Args:
        contract (str): _description_
        offset (str): _description_
        step (str): _description_
        ts (str): ts formated as "2019-08-24T14:15:22Z"

    Raises:
        Exception: _description_
        Exception: _description_

    Returns:
        list: [timestamp(list(str)), avg_price(list(float))]
    """
    contract_address = contract
    url = MN_REQ_COLLECTION_PRICE_HEADER + contract_address
    if offset not in MN_OFFSETS:
        raise Exception(f"Collection Price offset can only be {MN_OFFSETS}")
    if step not in MN_STEPS:
        raise Exception(f"Collection Price step can only be {MN_STEPS}")

    if ts is None:
        ts = datetime_to_mn_isoformat(datetime.datetime.now())

    query = {"duration": offset, "timestampLt": ts, "groupByPeriod": step}
    headers = {"X-API-Key": MN_API_KEY}
    response = requests.get(url, headers=headers, params=query)
    data = response.json()

    prices = [[], []]
    for dp in data["dataPoints"]:
        prices[0].append(dp["timestamp"])
        # When offset is longer than object existing time, pad with 0
        if dp["avg"] == "":
            prices[1].append(0)
        else:
            prices[1].append(float(dp["avg"]))

    return prices


def mn_get_collection_sales_volume(contract, offset, step, ts=None):
    """Get Sales volume of a NFT collection with address=`contract`
    Include sales count and sales volume(price sum) in past `offset` days
    grouped by time at a step size of `step`
    The count and sales volume are non-cumulative

    Args:
        contract (_type_): _description_
        offset (_type_): _description_
        step (_type_): _description_
        ts (_type_, optional): _description_. Defaults to None.

    Raises:
        Exception: _description_
        Exception: _description_

    Returns:
        list: [timestemp(list(str)), count(list(int)), volume(list(float))]
    """
    contract_address = contract
    url = MN_REQ_COLLECTION_VOLUMN_HEADER + contract_address
    if offset not in MN_OFFSETS:
        raise Exception(f"Collection Price offset can only be {MN_OFFSETS}")
    if step not in MN_STEPS:
        raise Exception(f"Collection Price step can only be {MN_STEPS}")

    if ts is None:
        ts = datetime_to_mn_isoformat(datetime.datetime.now())

    query = {"duration": offset, "timestampLt": ts, "groupByPeriod": step}
    headers = {"X-API-Key": MN_API_KEY}
    response = requests.get(url, headers=headers, params=query)
    data = response.json()

    volume = [[], [], []]
    for dp in data["dataPoints"]:
        volume[0].append(dp["timestamp"])
        volume[1].append(int(dp["count"]))
        volume[2].append(float(dp["volume"]))

    return volume


def mn_get_collection_sales_volume_by_day(contract, n_days):
    idx = 0
    n_days_options = [1, 7, 30, 365]
    while n_days > n_days_options[idx] and idx < 3:
        idx += 1
    res = mn_get_collection_sales_volume(contract, offset=MN_OFFSET[n_days_options[idx]], step=MN_STEP_1_DAY)
    return [res[0][-n_days:], res[1][-n_days:], res[2][-n_days:]]


def mn_get_collection_latest_1day_avg_price(contract):
    res = mn_get_collection_avg_prices(contract, offset=MN_OFFSET_1, step=MN_STEP_1_DAY)
    return res[1][0]


def mn_get_collection_latest_avg_prices_by_day(contract, n_days):
    """Daily average prices of a collection in past n days

    Args:
        contract (_type_): _description_
        n_days (_type_): _description_

    Returns:
        list(float): daily average prices in the ascending time order.

    """
    idx = 0
    n_days_options = [1, 7, 30, 365]
    while n_days > n_days_options[idx] and idx < 3:
        idx += 1
    res = mn_get_collection_avg_prices(contract, offset=MN_OFFSET[n_days_options[idx]], step=MN_STEP_1_DAY)
    return res[1][-n_days:]


if __name__ == "__main__":
    contract = "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258"
    token_id = "73969"
    print(mn_get_asset_transactions(contract, token_id, ascending=True))
    # mn_get_asset_raw_transactions(contract, token_id)
    # mn_get_asset_latest_price(contract, token_id)
    # mn_get_collection_avg_prices(contract, MN_OFFSET_7, MN_STEP_1_DAY)
    # mn_get_collection_sales_volume(contract, MN_OFFSET_1, MN_STEP_1_HR)
    # print(mn_get_collection_latest_1day_avg_price(contract))
    # print(mn_get_collection_latest_avg_prices_by_day(contract, 37))
    # print(mn_get_collection_sales_volume(contract, MN_OFFSET[365], MN_STEP_1_DAY))
    # print(mn_get_asset_transactions(contract, token_id, ascending=False))
