from web3 import Web3
import json

# Only for goeli testnet
from web3.middleware import geth_poa_middleware


# TODO: Add provider key
w3 = Web3(Web3.HTTPProvider("https://goerli.infura.io/v3/<INFURA_PROVIDER_KEY>"))

platform_public_address = "<PLATFORM_PUBLIC_ADDRESS>"
platform_private_key = "<PLATFORM_PRIVATE_KEY>"
user_address = "<ADDRESS_OF_USER_TO_SEND_FUNDS>"

# TODO: Transfer amount in the smallest unit of token.
transfer_amount = 10000

# Token contract address on Goerli Testnet
usdc_contract_address = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"

# Only for goeli testnet since it's proof-of-authority network.
w3.middleware_onion.inject(geth_poa_middleware, layer=0)


# ERC20 ABI
token_contract_abi = json.loads(
    '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]'
)

token_contract = w3.eth.contract(address=usdc_contract_address, abi=token_contract_abi)

# Transfer fund from platform to user. 2nd element in args list is funds v in smallest unit of token.
# From ERC20 contract.
transaction_data = token_contract.encodeABI(fn_name="transfer", args=[user_address, transfer_amount])


transaction = {
    "type": "0x2",
    "nonce": w3.eth.getTransactionCount(platform_public_address),
    "from": platform_public_address,
    "to": usdc_contract_address,
    "data": transaction_data,
    # Need to modify for mainnet.
    "maxFeePerGas": w3.toWei("250", "gwei"),
    # Need to modify for mainnet.
    "maxPriorityFeePerGas": w3.toWei("3", "gwei"),
    # Goerli testnet chain id.
    "chainId": 5,
}

gas = w3.eth.estimateGas(transaction)
transaction["gas"] = gas
signed_transaction = w3.eth.account.sign_transaction(transaction, platform_private_key)
# transaction_hash in HexBytes
transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
print(transaction_hash)
