from datetime import datetime, timedelta
from typing import Dict, List, cast
from eth_typing.encoding import HexStr
from flask import abort, current_app
from sqlalchemy import select
from web3.contract import Contract, ContractFunction
from web3.exceptions import TransactionNotFound
from web3 import Web3
from db import flask_session
from models.buyer_model import Buyer
from models.dealer_model import Dealer
from models.platform_transaction_model import PlatformTransaction, PlatformTransactionStatus


_MAXIMUM_MINT_TIME = timedelta(hours=12)


def withdraw_platform_transaction(username: str, transfer_value: float, as_dealer: bool):
    if transfer_value == 0:
        abort(400, "Cannot withdraw 0 token")
    token_currency = current_app.config["TOKEN_CURRENCY"]
    deducted_value = transfer_value + max(
        current_app.config["MINIMUM_TRANSACTION_FEE"], transfer_value * current_app.config["TRANSACTION_FEE_PERCENTAGE"]
    )
    platform_transfer_value = Web3.toWei(transfer_value, token_currency)
    platform_deducted_value = Web3.toWei(deducted_value, token_currency)
    if as_dealer:
        dealer: Dealer = flask_session.get(Dealer, username, with_for_update={"key_share": True})
        if not dealer:
            abort(404, f"Dealer {username} doesn't exist.")
        else:
            if dealer.balance - dealer.lockup_balance < deducted_value:
                abort(
                    409,
                    f"Withdrawing {transfer_value} require a balance of {deducted_value}, but the dealer only has {Dealer.balance}",
                )
            dealer.balance = Dealer.balance - deducted_value
    else:
        buyer: Buyer = flask_session.get(Buyer, username, with_for_update={"key_share": True})
        if not buyer:
            abort(404, f"Buyer {username} doesn't exist.")
        else:
            if buyer.balance < deducted_value:
                abort(
                    409,
                    f"Withdrawing {transfer_value} require a balance of {deducted_value}, but the buyer only has {Buyer.balance}",
                )
            buyer.balance = Buyer.balance - deducted_value

    web3: Web3 = current_app.config["WEB3"]
    token_contract: Contract = current_app.config["USDC_CONTRACT"]
    transaction_data = token_contract.encodeABI(
        fn_name="transfer", args=[Web3.toChecksumAddress(username), platform_deducted_value]
    )

    transaction = {
        "type": current_app.config["TRANSACTION_TYPE"],
        "nonce": web3.eth.getTransactionCount(Web3.toChecksumAddress(current_app.config["PLATFORM_ADDRESS"])),
        "from": Web3.toChecksumAddress(current_app.config["PLATFORM_ADDRESS"]),
        "to": current_app.config["USDC_CONTRACT"].address,
        "data": transaction_data,
        # Need to modify for mainnet.
        "maxFeePerGas": web3.toWei("250", "gwei"),
        # Need to modify for mainnet.
        "maxPriorityFeePerGas": web3.toWei("3", "gwei"),
        "chainId": current_app.config["CHAIN_ID"],
    }
    gas = web3.eth.estimateGas(transaction)
    transaction["gas"] = gas
    signed_transaction = web3.eth.account.sign_transaction(transaction, current_app.config["PLATFORM_PRIVATE_KEY"])
    # transaction_hash in HexBytes
    transaction_hash = web3.eth.send_raw_transaction(signed_transaction.rawTransaction).hex()
    if as_dealer:
        flask_session.add(
            PlatformTransaction(
                transaction_hash=transaction_hash,
                status=PlatformTransactionStatus.PENDING,
                as_dealer=as_dealer,
                amount=-platform_deducted_value,
                amount_without_fees=-platform_transfer_value,
                dealer_name=username,
            )
        )
    else:
        flask_session.add(
            PlatformTransaction(
                transaction_hash=transaction_hash,
                status=PlatformTransactionStatus.PENDING,
                as_dealer=as_dealer,
                amount=-platform_deducted_value,
                amount_without_fees=-platform_transfer_value,
                buyer_name=username,
            )
        )
    flask_session.commit()
    return transaction_hash


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
    as_dealer: bool,
    from_address: str,
    typed_pending_transaction: PlatformTransaction,
    transfer_value: float,
    is_withdrawal: bool,
) -> None:
    if is_withdrawal:
        typed_pending_transaction.status = PlatformTransactionStatus.APPROVED
        flask_session.commit()
    else:
        converted_transfer_value = Web3.fromWei(transfer_value, current_app.config["TOKEN_CURRENCY"])
        if as_dealer:
            dealer: Dealer = flask_session.get(Dealer, from_address, with_for_update={"key_share": True})
            if not dealer:
                typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
                typed_pending_transaction.verification_info = f"Dealer {from_address} does not exist"
                flask_session.commit()
            else:
                dealer.balance = Dealer.balance + converted_transfer_value
                typed_pending_transaction.status = PlatformTransactionStatus.APPROVED
                typed_pending_transaction.dealer_name = dealer.name
                flask_session.commit()
        else:
            buyer: Buyer = flask_session.get(Buyer, from_address, with_for_update={"key_share": True})
            if not buyer:
                typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
                typed_pending_transaction.verification_info = f"Buyer {from_address} does not exist"
                flask_session.commit()
            else:
                buyer.balance = Buyer.balance + converted_transfer_value
                typed_pending_transaction.status = PlatformTransactionStatus.APPROVED
                typed_pending_transaction.buyer_name = buyer.name
                flask_session.commit()


def _process_confirmed_transaction(
    changed_hashes: List[str],
    transaction_hash: HexStr,
    typed_pending_transaction: PlatformTransaction,
    web3: Web3,
    is_withdrawal: bool,
) -> None:
    changed_hashes.append(transaction_hash)
    try:
        transaction = web3.eth.get_transaction(transaction_hash)
        token_contract: Contract = current_app.config["USDC_CONTRACT"]
        transfer_function: ContractFunction
        abi_with_data: Dict
        try:
            transfer_function, abi_with_data = token_contract.decode_function_input(transaction["input"])
        except ValueError:
            typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
            typed_pending_transaction.verification_info = "Transaction is not an accepted token transfer"
            _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
            flask_session.commit()
            return
        if "_to" not in abi_with_data:
            typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
            typed_pending_transaction.verification_info = f'Function input {abi_with_data} does not have "_to" key'
            _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
            flask_session.commit()
            return
        if "_value" not in abi_with_data:
            typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
            typed_pending_transaction.verification_info = f'Function input {abi_with_data} does not have "_value" key'
            _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
            flask_session.commit()
            return

        to_address = abi_with_data["_to"].lower()
        from_address = transaction["from"].lower()
        if transfer_function.fn_name != token_contract.functions.transfer.fn_name:
            typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
            typed_pending_transaction.verification_info = (
                f"fn_name {transfer_function.fn_name} and {token_contract.functions.transfer.fn_name} do not agree"
            )
            _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
            flask_session.commit()
        elif (
            to_address != current_app.config["PLATFORM_ADDRESS"]
            and from_address != current_app.config["PLATFORM_ADDRESS"]
        ):
            # At least one of the from and to must be the platform address. Otherwise it's not related to our app at all.
            typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
            typed_pending_transaction.verification_info = f'Transaction to_address and from_address are not the platform address {current_app.config["PLATFORM_ADDRESS"]}'
            _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
            flask_session.commit()
        else:
            # Transactions that are legit
            as_dealer: bool = typed_pending_transaction.as_dealer
            transfer_value = abi_with_data["_value"]
            _process_almost_approved_transaction(
                as_dealer, from_address, typed_pending_transaction, transfer_value, is_withdrawal
            )
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
        is_withdrawal = _is_withdrawal(typed_pending_transaction)
        try:
            receipt = web3.eth.get_transaction_receipt(transaction_hash)
            if receipt["status"] == 1:
                _process_confirmed_transaction(
                    changed_hashes, transaction_hash, typed_pending_transaction, web3, is_withdrawal
                )
            elif receipt["status"] == 0:
                changed_hashes.append(transaction_hash)
                typed_pending_transaction.status = PlatformTransactionStatus.REJECTED
                typed_pending_transaction.verification_info = "Transaction reverted"
                _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
                flask_session.commit()
            else:
                changed_hashes.append(transaction_hash)
                typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
                typed_pending_transaction.verification_info = f'Unknown transaction status {receipt["status"]}'
                _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
                flask_session.commit()
        except TransactionNotFound:
            current_app.logger.warn(f"Transaction {transaction_hash} is not minted")
            if typed_pending_transaction.timestamp + _MAXIMUM_MINT_TIME < datetime.utcnow():
                changed_hashes.append(transaction_hash)
                typed_pending_transaction.status = PlatformTransactionStatus.ATTENTION_NEEDED
                typed_pending_transaction.verification_info = "Maximum mint time exceeded"
                _rollback_platform_transaction_if_withdrawal(typed_pending_transaction)
            flask_session.commit()
        except Exception:
            current_app.logger.error("Uncaught exception while checking pending platform transactions", exc_info=True)
            flask_session.commit()
        finally:
            flask_session.rollback()
    return changed_hashes


def _is_withdrawal(platform_transaction: PlatformTransaction) -> bool:
    return platform_transaction.amount_without_fees and platform_transaction.amount_without_fees < 0


def _rollback_platform_transaction_if_withdrawal(platform_transaction: PlatformTransaction) -> None:
    """
    If platform_transaction is determined to be a withdrawal transaction and it has failed.
    We should reimburse the dealer or buyer that initiated the withdrawal.

    This function does not commit any changes. The caller should make necessary commits and rollbacks.
    """
    if not _is_withdrawal(platform_transaction):
        return
    token_currency = current_app.config["TOKEN_CURRENCY"]
    if platform_transaction.as_dealer:
        dealer = flask_session.get(Dealer, platform_transaction.dealer_name, with_for_update={"key_share": True})
        dealer.balance = Dealer.balance + Web3.fromWei(-platform_transaction.amount_without_fees, token_currency)
    else:
        buyer = flask_session.get(Buyer, platform_transaction.buyer_name, with_for_update={"key_share": True})
        buyer.balance = Dealer.balance + Web3.fromWei(-platform_transaction.amount_without_fees, token_currency)
