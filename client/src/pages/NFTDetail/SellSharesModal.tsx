import React, { useEffect } from "react";
import { Form, InputNumber, Modal, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AccountType } from "../../reduxSlices/identitySlice";
import { authenticatedAxiosInstance } from "../../utils/network";
import { SellSharesRequestBody } from "../../backendTypes";
import { fetchDealInfoForOneDeal } from "../../reduxSlices/dealInfoSlice";
import { genericErrorModal } from "../../components/error/genericErrorModal";

interface SellSharesFormValues {
  dealSerialId: number;
}

interface SellSharesModalProps {
  dealSerialIdPrepopulated?: number;
  isModalVisible: boolean;
  setIsModalVisible: (visibility: boolean) => void;
}

const SellSharesModal = ({
  dealSerialIdPrepopulated,
  isModalVisible,
  setIsModalVisible,
}: SellSharesModalProps) => {
  const { Text } = Typography;
  const [form] = Form.useForm<SellSharesFormValues>();
  const identity = useAppSelector((state) => state.identity);
  const isBuyer = identity?.account_type === AccountType.BUYER;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (dealSerialIdPrepopulated !== undefined) {
      dispatch(fetchDealInfoForOneDeal(dealSerialIdPrepopulated));
    }
  }, [dealSerialIdPrepopulated, dispatch]);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const validatedValues = await form.validateFields();
      if (!isBuyer) {
        Modal.error({
          title: "Identity Error",
          content: <div>You are not a buyer</div>,
        });
        return;
      }
      const postBody: SellSharesRequestBody = {
        buyer_name: identity.username,
        deal_serial_id: validatedValues.dealSerialId,
      };
      try {
        await authenticatedAxiosInstance().post("/transaction/sell", postBody);
        setIsModalVisible(false);
        form.resetFields();
      } catch (e: any) {
        genericErrorModal("Sell Shares Error", e);
      }
    } catch (e) {
      console.error("Validation failed when creating deal", e);
    }
  };

  return (
    <Modal
      title="Sell Shares"
      cancelText="Cancel"
      okText="Confirm"
      visible={isModalVisible}
      onCancel={handleCancel}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <Form.Item
          name="dealSerialId"
          label="Deal Serial ID"
          initialValue={dealSerialIdPrepopulated}
        >
          <InputNumber controls={false} disabled />
        </Form.Item>
      </Form>

      <Text
        type="danger"
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0px",
        }}
      >
        Note: All bought shares will be sold.
      </Text>
    </Modal>
  );
};

export default SellSharesModal;
