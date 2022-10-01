import React, { useEffect } from "react";
import { Form, InputNumber, Modal } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AccountType } from "../../reduxSlices/identitySlice";
import { authenticatedAxiosInstance } from "../../utils/network";
import { BuySharesRequestBody } from "../../backendTypes";
import { fetchDealInfoForOneDeal } from "../../reduxSlices/dealInfoSlice";
import { selectDealInfoForSerialId } from "../../selectors/dealInfo";
import { genericErrorModal } from "../../components/error/genericErrorModal";

interface BuySharesFormValues {
  dealSerialId: number;
  shares: number;
}

interface BuySharesModalProps {
  dealSerialIdPrepopulated?: number;
  isModalVisible: boolean;
  setIsModalVisible: (visibility: boolean) => void;
}

const BuySharesModal = ({
  dealSerialIdPrepopulated,
  isModalVisible,
  setIsModalVisible,
}: BuySharesModalProps) => {
  const [form] = Form.useForm<BuySharesFormValues>();
  const identity = useAppSelector((state) => state.identity);
  const isBuyer = identity?.account_type === AccountType.BUYER;
  const dispatch = useAppDispatch();
  const dealInfo = useAppSelector(
    selectDealInfoForSerialId(dealSerialIdPrepopulated)
  );

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
      const postBody: BuySharesRequestBody = {
        buyer_name: identity.username,
        deal_serial_id: validatedValues.dealSerialId,
        shares: validatedValues.shares,
      };
      try {
        await authenticatedAxiosInstance().post("/transaction/buy", postBody);
        setIsModalVisible(false);
        form.resetFields();
      } catch (e: any) {
        genericErrorModal("Buy Shares Error", e);
      }
    } catch (e) {
      console.error("Validation failed when creating deal", e);
    }
  };

  return (
    <Modal
      title="Buy Shares"
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
          validateFirst
          rules={[
            {
              required: true,
              message: "Please input a deal serial ID",
            },
          ]}
          initialValue={dealSerialIdPrepopulated}
        >
          <InputNumber controls={false} />
        </Form.Item>
        <Form.Item
          name="shares"
          label="Number of Shares"
          validateFirst
          rules={[
            {
              required: true,
              message: "Number of shares that can be purchased in this deal",
            },
            {
              validator: async (_, numberOfShares: number) => {
                if (!!dealInfo && dealInfo.shares_remaining < numberOfShares) {
                  throw new Error(
                    `The deal only has ${dealInfo.shares_remaining} shares remaining`
                  );
                }
              },
            },
          ]}
        >
          <InputNumber placeholder="Number of shares" min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BuySharesModal;
