from web3 import Web3
import json

w3 = Web3(Web3.HTTPProvider("https://goerli.infura.io/v3/<Infura_provider_key>"))

# If the transaction has not yet been mined, this method will raise a TransactionNotFound error.
receipt = w3.eth.get_transaction_receipt("<txn_hash>")
if receipt["status"] != 1:
    # The transaction failed. DO NOT PROCEED
    pass

transaction = w3.eth.get_transaction("<txn_hash>")


erc20_abi = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]'

# Get contract
token_contract_abi = json.loads(erc20_abi)
# Address is Goerli test net USD Coin contract address
token_contract = w3.eth.contract(address="0x07865c6E87B9F70255377e024ace6630C1Eaa37F", abi=token_contract_abi)

transfer_function = token_contract.decode_function_input(transaction["input"])[0]
to_address = token_contract.decode_function_input(transaction["input"])[1]["_to"]
# Transfer value is in smallest denomination of token
transfer_value = token_contract.decode_function_input(transaction["input"])[1]["_value"]
from_address = transaction["from"]

# Backend needs to check to_address is platform address
if to_address != "<platform_address>":
    # Wrong address. DO NOT PROCEED
    pass

# Backend needs to verify transfer_function.
if getattr(transfer_function, "fn_name") != getattr(token_contract.functions.transfer, "fn_name"):
    # Wrong function. DO NOT PROCEED
    pass

# Backend needs to check database has from_address username.
# Backend write add transfer_value to user entry in database.
