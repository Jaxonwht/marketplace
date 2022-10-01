import React, { useEffect } from "react";
import moment, { Moment } from "moment";
import web3 from "web3";
import { Form, DatePicker, Input, InputNumber, Modal, Switch } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AccountType } from "../../reduxSlices/identitySlice";
import { authenticatedAxiosInstance } from "../../utils/network";
import { CreateDealResponse, CreateDealRequestBody } from "../../backendTypes";
import { fetchBackendConfig } from "../../reduxSlices/backendConfigSlice";
import { genericErrorModal } from "../../components/error/genericErrorModal";

interface CreateDealFormValues {
  collectionId: string;
  assetId?: number | null;
  isNftIndex: boolean;
  rate: number;
  shares: number;
  sharePrice: number;
  multiplier: number;
  timeRange: [Moment, Moment];
}

interface CreateDealModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visibility: boolean) => void;
}

const CreateDealModal = ({
  isModalVisible,
  setIsModalVisible,
}: CreateDealModalProps) => {
  const { RangePicker } = DatePicker;
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
      const { isNftIndex, collectionId } = validatedValues;
      if (!isNftIndex && !web3.utils.isAddress(collectionId)) {
        Modal.error({
          title: "Invalid Collection Address",
          content: <div>The address is not a valid contract address</div>,
        });
        return;
      }
      if (!identity || identity.account_type !== AccountType.DEALER) {
        Modal.error({
          title: "Identity Error",
          content: <div>You are not a dealer</div>,
        });
        return;
      }
      const postBody: CreateDealRequestBody = {
        dealer_name: identity.username,
        collection_id: validatedValues.collectionId,
        asset_id:
          validatedValues.assetId == null
            ? undefined
            : String(validatedValues.assetId),
        is_nft_index: validatedValues.isNftIndex,
        rate: validatedValues.rate,
        initial_number_of_shares: validatedValues.shares,
        share_price: validatedValues.sharePrice,
        multiplier: validatedValues.multiplier,
        start_time: validatedValues.timeRange[0],
        end_time: validatedValues.timeRange[1],
      };
      try {
        authenticatedAxiosInstance().post("/deal/", postBody);
        setIsModalVisible(false);
        form.resetFields();
      } catch (e: any) {
        genericErrorModal("Deal Creation Error", e);
      }
    } catch (e) {
      console.error("Validation faild when creating deal", e);
    }
  };

  return (
    <Modal
      title="Create a Deal"
      cancelText="Cancel"
      okText="Confirm"
      visible={isModalVisible}
      onCancel={handleCancel}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <Form.Item
          name="collectionId"
          label="Collection/Index ID"
          validateFirst
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
        <Form.Item
          name="isNftIndex"
          label="Is an NFT Index"
          valuePropName="checked"
          initialValue={false}
          rules={[
            {
              required: true,
              message: "You must specify whether this is an NFT index",
            },
          ]}
        >
          <Switch checkedChildren="yes" unCheckedChildren="no" />
        </Form.Item>
        <Form.Item name="assetId" label="NFT Asset ID">
          <InputNumber controls={false} />
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
            max={backendConfig?.maximum_allowed_rate ?? 0.2}
            formatter={(value) => `${(value ?? 0) * 100}%`}
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
          name="sharePrice"
          label="Price per share"
          rules={[
            {
              required: true,
              message: "Price per share",
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
          validateFirst
          rules={[
            {
              required: true,
              message: "Start and end times of the deal in your timezone",
            },
            {
              validator: async (_, [startTime, endTime]: [Moment, Moment]) => {
                const minEndTime = moment.max(
                  moment(startTime).add(
                    backendConfig?.min_end_time_delay_from_start_time_days ?? 7,
                    "days"
                  ),
                  moment()
                );
                if (endTime < minEndTime) {
                  throw new Error(`End time must be later than ${minEndTime}`);
                }
              },
            },
          ]}
        >
          <RangePicker
            showTime
            ranges={{
              "next month": [moment(), moment().add(1, "month")],
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDealModal;
