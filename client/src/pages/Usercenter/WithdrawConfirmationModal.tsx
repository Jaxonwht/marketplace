import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "./style.module.scss";
import { Modal } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { authenticatedAxiosInstance } from "../../utils/network";
import { AccountType } from "../../reduxSlices/identitySlice";
import { fetchBalance } from "../../reduxSlices/balanceSlice";

interface WithdrawConfirmationModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (isVisible: boolean) => void;
}

const WithdrawConfirmationModal = ({
  isModalVisible,
  setIsModalVisible,
}: WithdrawConfirmationModalProps) => {
  const identity = useAppSelector((state) => state.identity);
  const balance = useAppSelector((state) => state.balance);
  const [amount, setAmount] = useState("");
  const availableBalance = balance?.balance
    ? balance.balance - (balance?.lockup_balance || 0)
    : 0;
  const readyToSend =
    !!amount &&
    !!identity &&
    amount !== "0" &&
    Number(amount) < availableBalance;
  const handleAmountInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setAmount(event.target.value);
  };
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (isModalVisible && !!identity) {
      dispatch(
        fetchBalance(
          identity.username,
          identity.account_type === AccountType.DEALER
        )
      );
    }
  }, [dispatch, identity, isModalVisible]);
  return (
    <Modal
      title=""
      cancelText="Cancel"
      okText="Confirm"
      okButtonProps={{ disabled: !readyToSend }}
      visible={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
      }}
      onOk={async () => {
        if (readyToSend) {
          await authenticatedAxiosInstance().post(
            "platform-transaction/withdraw",
            {
              username: identity.username,
              transfer_value: Number(amount),
              as_dealer: identity.account_type === AccountType.DEALER,
            }
          );
        }
        setIsModalVisible(false);
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0px",
        }}
      >
        <div className={styles.addBalanceModalText}>Add Balance</div>
        <div className={styles.addBalanceModalText}>
          {balance?.balance || 0}
        </div>
      </div>
      <input
        value={amount}
        onChange={handleAmountInputChanged}
        type="number"
        min={0}
        placeholder="Amount of tokens to withdraw"
      />
    </Modal>
  );
};

export default WithdrawConfirmationModal;
