import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "./style.module.scss";
import { Modal } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ERC_20_ABI, GOERLI_USDC, PLATFORM_ADDRESS } from "../../utils/network";
import { handleSendTransaction } from "../../utils/sendTokens";
import { fetchBalance } from "../../reduxSlices/balanceSlice";
import { AccountType } from "../../reduxSlices/identitySlice";

interface AddBalanceConfirmationModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (isVisible: boolean) => void;
}

const AddBalanceConfirmationModal = ({
  isModalVisible,
  setIsModalVisible,
}: AddBalanceConfirmationModalProps) => {
  const identity = useAppSelector((state) => state.identity);
  const balance = useAppSelector((state) => state.balance);
  const [amount, setAmount] = useState("");
  const readyToSend =
    !!amount && !!identity && amount !== "0" && Number(amount) > 0;
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
          await handleSendTransaction(
            identity.username,
            ERC_20_ABI,
            GOERLI_USDC,
            PLATFORM_ADDRESS,
            amount
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
          {balance?.balance || "Unknown balance"}
        </div>
      </div>
      <input
        value={amount}
        onChange={handleAmountInputChanged}
        type="number"
        min={0}
        placeholder="Amount of tokens to send"
      />
    </Modal>
  );
};

export default AddBalanceConfirmationModal;
