import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Modal, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { authenticatedAxiosInstance } from "../../utils/network";
import { AccountType } from "../../reduxSlices/identitySlice";
import { fetchBalance } from "../../reduxSlices/balanceSlice";
import { genericErrorModal } from "../../components/error/genericErrorModal";

interface WithdrawConfirmationModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (isVisible: boolean) => void;
}

const WithdrawConfirmationModal = ({
  isModalVisible,
  setIsModalVisible,
}: WithdrawConfirmationModalProps) => {
  const { Text } = Typography;
  const identity = useAppSelector((state) => state.identity);
  const balance = useAppSelector((state) => state.balance);
  const [amount, setAmount] = useState("0");
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
      title="Cash Out"
      cancelText="Cancel"
      okText="Confirm"
      okButtonProps={{ disabled: !readyToSend }}
      visible={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
      }}
      onOk={async () => {
        if (readyToSend) {
          try {
            await authenticatedAxiosInstance().post(
              "/platform-transaction/withdraw",
              {
                username: identity.username,
                transfer_value: Number(amount),
                as_dealer: identity.account_type === AccountType.DEALER,
              }
            );
          } catch (e) {
            genericErrorModal("Withdraw Error", e);
          }
        }
        setIsModalVisible(false);
      }}
    >
      <Text
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0px",
        }}
      >
        Current Balance: {balance?.balance || 0}
      </Text>

      <Text
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0px",
        }}
      >
        A total of max(0.01, {amount}) will be deducted from your balance.
      </Text>
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
