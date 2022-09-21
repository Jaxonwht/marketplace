import ReactJson from "@textea/json-viewer";
import { Card, Descriptions } from "antd";
import type { DealInfo } from "../../backendTypes";
import { utcStringToLocalShort } from "../../utils/datetime";
import styles from "./style.module.scss";

interface DealInfoCardProps {
  readonly dealInfo?: DealInfo;
}

const DealInfoCard = ({ dealInfo }: DealInfoCardProps) => {
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
            {
              // TODO ZIYI
            }
            0.5
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
