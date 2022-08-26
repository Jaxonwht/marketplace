import React, { useEffect } from "react";
import { Moment } from "moment";
import { Form, DatePicker, Input, InputNumber, Modal } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AccountType } from "../../reduxSlices/identitySlice";
import { authenticatedAxiosInstance } from "../../utils/network";
import { CreateDealResponse, CreateDealRequestBody } from "../../backendTypes";
import { fetchBackendConfig } from "../../reduxSlices/backendConfigSlice";

interface CreateDealFormValues {
  collectionId: string;
  assetId?: string;
  rate: number;
  shares: number;
  multiplier: number;
  timeRange: [Moment, Moment];
}

interface CreateDealModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visibility: boolean) => void;
}

const { RangePicker } = DatePicker;

const CreateDealModal = ({
  isModalVisible,
  setIsModalVisible,
}: CreateDealModalProps) => {
  const [form] = Form.useForm<CreateDealFormValues>();
  const identity = useAppSelector((state) => state.identity);
  const dispatch = useAppDispatch();
  const backendConfig = useAppSelector((state) => state.backendConfig);

  useEffect(() => {
    if (isModalVisible) {
      dispatch(fetchBackendConfig);
    }
  }, [dispatch, isModalVisible]);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const validatedValues = await form.validateFields();
      if (!identity || identity.account_type !== AccountType.DEALER) {
        console.error("You are not a dealer");
        return;
      }
      const postBody: CreateDealRequestBody = {
        dealer_name: identity.username,
        collection_id: validatedValues.collectionId,
        asset_id: validatedValues.assetId,
        rate: validatedValues.rate,
        shares: validatedValues.shares,
        multiplier: validatedValues.multiplier,
        start_time: validatedValues.timeRange[0],
        end_time: validatedValues.timeRange[1],
      };
      try {
        const response = authenticatedAxiosInstance().post("/deal", postBody);
        const createdDealInfo = (await response).data as CreateDealResponse;
        console.log(createdDealInfo);
        setIsModalVisible(false);
        form.resetFields();
      } catch (e) {
        console.error("Failed to create a deal", e);
      }
    } catch (e) {
      console.error("Validation faild when creating deal", e);
    }
  };

  return (
    <Modal
      title=""
      cancelText="Cancel"
      okText="Confirm"
      visible={isModalVisible}
      onCancel={handleCancel}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <Form.Item
          name="collectionId"
          label="Collection TXN Addr"
          rules={[
            {
              required: true,
              message:
                "Please input the transaction address of the NFT collection on the ETH chain",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="assetId" label="NFT Asset ID">
          <Input placeholder="(Optional) the asset ID if you want to create a deal on a specific asset" />
        </Form.Item>
        <Form.Item
          name="rate"
          label="Cap on Profit/Loss"
          rules={[
            {
              required: true,
              message: "Profit or loss is capped by this ratio",
            },
          ]}
        >
          <InputNumber
            placeholder="Cap on P/L"
            min={0}
            max={100 * (backendConfig?.maximum_allowed_rate ?? 0.2)}
            formatter={(value) => `${value}%`}
            parser={(rawValue) =>
              Number(rawValue?.replace("%", "") ?? "0") / 100
            }
          />
        </Form.Item>
        <Form.Item
          name="shares"
          label="Number of Shares"
          rules={[
            {
              required: true,
              message: "Number of shares that can be purchased in this deal",
            },
          ]}
        >
          <InputNumber placeholder="Number of shares" min={0} />
        </Form.Item>
        <Form.Item
          name="multiplier"
          label="Multiplier"
          rules={[
            {
              required: true,
              message:
                "Ratio of share price percentage change in comparison to the underlying asset or collection percentage change",
            },
          ]}
          initialValue={1}
        >
          <InputNumber
            placeholder="Multiplier"
            min={backendConfig?.min_deal_multiplier ?? -10}
            max={backendConfig?.max_deal_multiplier ?? 10}
          />
        </Form.Item>
        <Form.Item
          name="timeRange"
          label="Time Range"
          rules={[
            {
              required: true,
              message: "Start and end times of the deal in your timezone",
            },
          ]}
        >
          <RangePicker showTime />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDealModal;
