"""Production config."""
from pathlib import Path
from logging import INFO
from web3 import Web3
from eth_typing.evm import ChecksumAddress, HexAddress
from eth_typing.encoding import HexStr
from web3.contract import Contract
from configs.base import Config


class ProductionConfig(Config):  # pylint: disable=too-few-public-methods
    """Configurations used during production."""

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate the database uri from secret file"""
        return (Path("/var") / "SQLALCHEMY_DATABASE_URI").read_text()

    @property
    def ADMIN_PASSWORD(self) -> str:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate the admin password from secret file"""
        return (Path("/var") / "ADMIN_PASSWORD").read_text()

    @property
    def JWT_SECRET_KEY(self) -> bytes:  # type: ignore # pylint: disable=invalid-name
        """Lazily evaluate the jwt secret key from secret file"""
        return bytes.fromhex((Path("/var") / "JWT_SECRET_KEY").read_text())

    @property
    def WEB3(self) -> Web3:  # pylint: disable=invalid-name
        """Lazily evaluate w3 instance."""
        infura_provider_key = (Path("/var") / "INFURA_PROVIDER_KEY").read_text()
        return Web3(Web3.HTTPProvider(f"https://goerli.infura.io/v3/{infura_provider_key}"))

    @property
    def USDC_CONTRACT(self) -> Contract:  # pylint: disable=invalid-name
        """Lazily evaluate USDC contract."""
        return self.WEB3.eth.contract(
            address=ChecksumAddress(HexAddress(HexStr(ProductionConfig.USDC_CONTRACT_ADDRESS))),
            abi=ProductionConfig.ERC20_ABI,
        )

    SQLALCHEMY_ECHO = False
    MAIN_LOGGING_LEVEL = INFO
    SCHEDULER_URL = "http://scheduler-service-prod:4000"
    JWT_COOKIE_SECURE = True
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
