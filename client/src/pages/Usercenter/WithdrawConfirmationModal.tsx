import React, { useEffect, useState } from "react";
import { Modal, Typography, InputNumber } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  authenticatedAxiosInstance,
  MINIMUM_TRANSACTION_FEE,
  TRANSACTION_FEE_PERCENTAGE,
} from "../../utils/network";
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
  const totalAmountWithdrawn =
    Number(amount) +
    Math.max(
      MINIMUM_TRANSACTION_FEE,
      Number(amount) * TRANSACTION_FEE_PERCENTAGE
    );
  const availableBalance = balance?.balance
    ? balance.balance - (balance?.lockup_balance || 0)
    : 0;
  const readyToSend =
    !!amount &&
    !!identity &&
    amount !== "0" &&
    totalAmountWithdrawn < availableBalance;
  const handleAmountInputChanged = (value: string | null) => {
    setAmount(value ? value : "");
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
      <InputNumber
        style={{ width: 200 }}
        stringMode
        controls={false}
        value={amount}
        onChange={handleAmountInputChanged}
        min={"0"}
        placeholder="Amount of tokens to withdraw"
      />
      <Text
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0px",
        }}
      >
        Total funds to be withdrawn: {totalAmountWithdrawn}
      </Text>
      <Text
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0px",
        }}
      >
        {totalAmountWithdrawn <
        MINIMUM_TRANSACTION_FEE / TRANSACTION_FEE_PERCENTAGE +
          MINIMUM_TRANSACTION_FEE
          ? `Note: A minimum transaction fee of ${MINIMUM_TRANSACTION_FEE} will be added.`
          : `Note: A transaction fee percentage of ${
              TRANSACTION_FEE_PERCENTAGE * 100
            }% will be applied.`}
      </Text>
    </Modal>
  );
};

export default WithdrawConfirmationModal;
