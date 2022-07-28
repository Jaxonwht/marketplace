from datetime import datetime, timedelta
from typing import Any, List, cast
from eth_typing.encoding import HexStr
from flask import abort, current_app
from sqlalchemy import select
from web3.contract import Contract, ContractFunction
from web3.exceptions import TransactionNotFound
from web3.types import TxReceipt
from db import flask_session
from web3 import Web3
from models.buyer_model import Buyer
from models.dealer_model import Dealer
from models.platform_transaction_model import PlatformTransaction, PlatformTransactionStatus

_MAXIMUM_MINT_TIME = timedelta(hours=12)


def add_platform_transaction_if_not_exists(transaction_hash: str, as_dealer: bool) -> None:
    platform_transaction = flask_session.get(PlatformTransaction, transaction_hash)
    if platform_transaction:
        current_app.logger.warn(f"Platform transaction with hash {transaction_hash} already exists")
        return
    flask_session.add(
        PlatformTransaction(
            transaction_hash=transaction_hash, status=PlatformTransactionStatus.PENDING, as_dealer=as_dealer
        )
    )
    flask_session.commit()


def get_platform_transaction(transaction_hash: str) -> PlatformTransaction:
    platform_transaction = flask_session.get(PlatformTransaction, transaction_hash)
    if not platform_transaction:
        abort(404, f"Platform transaction with hash {transaction_hash} does not exist")
    return platform_transaction


def _process_almost_approved_transaction(
    as_dealer: bool, from_address: str, typed_pending_transaction: PlatformTransaction, transfer_value: float
) -> None:
    typed_pending_transaction.amount = transfer_value
    if as_dealer:
        dealer: Dealer = flask_session.get(Dealer, from_address.lower(), with_for_update={"key_share": True})
        if not dealer:
            typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
            typed_pending_transaction.verification_info = f"Dealer {from_address} does not exist"
            flask_session.commit()
        else:
            dealer.balance = Dealer.balance + transfer_value
            typed_pending_transaction.status = PlatformTransactionStatus.APPROVED
            typed_pending_transaction.dealer_name = dealer.name
            flask_session.commit()
    else:
        buyer: Buyer = flask_session.get(Buyer, from_address.lower(), with_for_update={"key_share": True})
        if not buyer:
            typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
            typed_pending_transaction.verification_info = f"Dealer {from_address} does not exist"
            flask_session.commit()
        else:
            buyer.balance = Buyer.balance + transfer_value
            typed_pending_transaction.status = PlatformTransactionStatus.APPROVED
            typed_pending_transaction.buyer_name = buyer.name
            flask_session.commit()


def _process_confirmed_transaction(
    changed_hashes: List[str], transaction_hash: HexStr, typed_pending_transaction: PlatformTransaction, web3: Web3
) -> None:
    changed_hashes.append(transaction_hash)
    try:
        transaction = web3.eth.get_transaction(transaction_hash)
        token_contract: Contract = current_app.config["USDC_CONTRACT"]
        transfer_function: ContractFunction
        abi_with_data: Any
        try:
            transfer_function, abi_with_data = token_contract.decode_function_input(transaction["input"])
        except ValueError:
            typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
            typed_pending_transaction.verification_info = "Transaction is not an accepted token transfer"
            flask_session.commit()
            return
        to_address = abi_with_data["_to"]
        if transfer_function.fn_name != token_contract.functions.transfer.fn_name:
            typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
            typed_pending_transaction.verification_info = (
                f"fn_name {transfer_function.fn_name} and {token_contract.functions.transfer.fn_name} do not agree"
            )
            flask_session.commit()
        elif to_address.lower() != current_app.config["PLATFORM_ADDRESS"]:
            typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
            typed_pending_transaction.verification_info = (
                f'Transaction to_address is not the platform address {current_app.config["PLATFORM_ADDRESS"]}'
            )
            flask_session.commit()
        else:
            # Transactions that are legit
            as_dealer: bool = typed_pending_transaction.as_dealer
            from_address = transaction["from"]
            transfer_value = abi_with_data["_value"]
            _process_almost_approved_transaction(as_dealer, from_address, typed_pending_transaction, transfer_value)
    except TransactionNotFound:
        flask_session.commit()
        current_app.logger.error("Should not happen", exc_info=True)


def check_pending_transactions() -> List[str]:
    changed_hashes: List[str] = []
    web3: Web3 = current_app.config["WEB3"]
    for pending_transaction in flask_session.scalars(
        select(PlatformTransaction).filter_by(status=PlatformTransactionStatus.PENDING)
    ):
        flask_session.refresh(pending_transaction, with_for_update={"key_share": True})
        typed_pending_transaction = cast(PlatformTransaction, pending_transaction)
        transaction_hash: HexStr = typed_pending_transaction.transaction_hash
        try:
            receipt = web3.eth.get_transaction_receipt(transaction_hash)
            if receipt["status"] == 1:
                _process_confirmed_transaction(changed_hashes, transaction_hash, typed_pending_transaction, web3)
            elif receipt["status"] == 0:
                changed_hashes.append(transaction_hash)
                typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
                typed_pending_transaction.verification_info = "Transaction reverted"
                flask_session.commit()
            else:
                changed_hashes.append(transaction_hash)
                typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
                typed_pending_transaction.verification_info = f'Unknown transaction status {receipt["status"]}'
                flask_session.commit()
        except TransactionNotFound:
            current_app.logger.warn(f"Transaction {transaction_hash} is not minted")
            if typed_pending_transaction.timestamp + _MAXIMUM_MINT_TIME < datetime.now():
                changed_hashes.append(transaction_hash)
                typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
                typed_pending_transaction.verification_info = "Maximum mint time exceeded"
            flask_session.commit()
        except Exception:
            current_app.logger.error("Uncaught exception while checking pending platform transactions", exc_info=True)
            flask_session.commit()
        finally:
            flask_session.rollback()
    return changed_hashes
