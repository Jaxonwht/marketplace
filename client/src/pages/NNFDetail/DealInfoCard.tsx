import ReactJson from "@textea/json-viewer";
import { Card, Descriptions } from "antd";
import { useEffect } from "react";
import type { DealInfo } from "../../backendTypes";
import { fetchOneAssetPrice } from "../../reduxSlices/assetPriceSlice";
import { selectAssetPriceForDeal } from "../../selectors/assetPrice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { utcStringToLocalShort } from "../../utils/datetime";
import styles from "./style.module.scss";

interface DealInfoCardProps {
  readonly dealInfo?: DealInfo;
}

const DealInfoCard = ({ dealInfo }: DealInfoCardProps) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (dealInfo !== undefined) {
      dispatch(fetchOneAssetPrice(dealInfo?.serial_id));
    }
  }, [dealInfo, dispatch]);

  const currentAssetPrice = useAppSelector(
    selectAssetPriceForDeal(dealInfo?.serial_id)
  );

  return (
    <Card title="DEAL INFO" className={styles["narrow-window"]}>
      {!!dealInfo ? (
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Profit/Loss Cap">
            {dealInfo.rate * 100}%
          </Descriptions.Item>
          <Descriptions.Item label="Multiplier">
            {dealInfo.multiplier}
          </Descriptions.Item>
          <Descriptions.Item label="Current Asset Price">
            {currentAssetPrice ?? "Unknown asset price"}
          </Descriptions.Item>
          <Descriptions.Item label="Start Time">
            {utcStringToLocalShort(dealInfo.start_time)}
          </Descriptions.Item>
          <Descriptions.Item label="End Time">
            {utcStringToLocalShort(dealInfo.end_time)}
          </Descriptions.Item>
          <Descriptions.Item label="Share Price">
            {dealInfo.share_price}
          </Descriptions.Item>
          <Descriptions.Item label="Shares Remaining">
            {dealInfo.shares_remaining}
          </Descriptions.Item>
          {dealInfo.extra_info && (
            <Descriptions.Item label="Extra Info">
              <ReactJson
                displayDataTypes={false}
                displayObjectSize={false}
                name={false}
                src={dealInfo.extra_info}
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <div>Unknown Deal??</div>
      )}
    </Card>
  );
};

export default DealInfoCard;
