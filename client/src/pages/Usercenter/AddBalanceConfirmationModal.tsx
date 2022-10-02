import React, { useEffect, useState } from "react";
import { InputNumber, Modal, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ERC_20_ABI, GOERLI_USDC, PLATFORM_ADDRESS } from "../../utils/network";
import { handleSendTransaction } from "../../utils/sendTokens";
import { fetchBalance } from "../../reduxSlices/balanceSlice";
import { AccountType } from "../../reduxSlices/identitySlice";
import { genericErrorModal } from "../../components/error/genericErrorModal";

interface AddBalanceConfirmationModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (isVisible: boolean) => void;
}

const AddBalanceConfirmationModal = ({
  isModalVisible,
  setIsModalVisible,
}: AddBalanceConfirmationModalProps) => {
  const { Text } = Typography;
  const identity = useAppSelector((state) => state.identity);
  const balance = useAppSelector((state) => state.balance);
  const [amount, setAmount] = useState("0");
  const readyToSend =
    !!amount && !!identity && amount !== "0" && Number(amount) > 0;
  const handleAmountInputChanged = (value: string) => {
    setAmount(value);
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
      title="Add Funds"
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
            await handleSendTransaction(
              identity.username,
              ERC_20_ABI,
              GOERLI_USDC,
              PLATFORM_ADDRESS,
              amount,
              identity.account_type === AccountType.DEALER
            );
          } catch (e) {
            genericErrorModal("Top-up Error", e);
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
        value={amount}
        onChange={handleAmountInputChanged}
        type="number"
        min={"0"}
        placeholder="Amount of tokens to add"
      />
    </Modal>
  );
};

export default AddBalanceConfirmationModal;
