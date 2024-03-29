"""Base config."""
from datetime import timedelta
import os
import json
from logging import DEBUG
from eth_typing.evm import ChecksumAddress, HexAddress
from eth_typing.encoding import HexStr
from requests import Session
from web3 import Web3

from web3.contract import Contract

# TODO: Only for goeli testnet
from web3.middleware.geth_poa import geth_poa_middleware


class Config:  # pylint: disable=too-few-public-methods
    """Base configuration shared by all configs."""

    TESTING = False
    SQLALCHEMY_DATABASE_URI = "postgresql://local_user:dev_password@localhost:5432/local_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    MAIN_LOGGING_LEVEL = DEBUG
    SCHEDULER_URL = "http://localhost:4000"
    JWT_TOKEN_LOCATION = ["headers"]
    PLATFORM_ADDRESS = "0x49d0739eb001ff73b394a5a2054694a650dc9cec"
    TOKEN_CURRENCY = "mwei"  # 6 decimals
    SCHEDULER_REQUEST_SESSION = Session()

    @property
    def PLATFORM_PRIVATE_KEY(self) -> str:  # pylint: disable=invalid-name
        private_key = os.getenv("PLATFORM_PRIVATE_KEY")
        if private_key is None:
            raise Exception("PLATFORM_PRIVATE_KEY is not set")
        return private_key

    @property
    def WEB3(self) -> Web3:  # pylint: disable=invalid-name
        """Lazily evaluate w3 instance."""
        infura_provider_key = os.getenv("INFURA_PROVIDER_KEY")
        if not infura_provider_key:
            raise Exception("INFURA_PROVIDER_KEY must be set")
        web3 = Web3(Web3.HTTPProvider(f"https://goerli.infura.io/v3/{infura_provider_key}"))
        # TODO: Only for goeli testnet since it's proof-of-authority network.
        web3.middleware_onion.inject(geth_poa_middleware, layer=0)
        return web3

    @property
    def USDC_CONTRACT(self) -> Contract:  # pylint: disable=invalid-name
        """Lazily evaluate USDC contract."""
        return self.WEB3.eth.contract(
            address=ChecksumAddress(HexAddress(HexStr(Config.USDC_CONTRACT_ADDRESS))), abi=Config.ERC20_ABI
        )

    # Maximum allowed rate of profit or loss.
    MAXIMUM_ALLOWED_RATE = 0.2

    # Minimum delay of end_time from start_time of a deal
    MIN_END_TIME_DELAY_FROM_START_TIME = timedelta(weeks=1)

    # Goerli only
    USDC_CONTRACT_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"

    # Goerli only
    CHAIN_ID = 5

    TRANSACTION_TYPE = "0x2"

    TRANSACTION_FEE_PERCENTAGE = 0.02
    MINIMUM_TRANSACTION_FEE = 0.01

    ERC20_ABI = json.loads(
        '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]'
    )

    MIN_DEAL_MULTIPLIER = -5
    MAX_DEAL_MULTIPLIER = 5
