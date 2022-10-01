import { useEffect, useState } from "react";
import { Button, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import styles from "./style.module.scss";
import CreateDealModal from "./CreateDealModal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectIsDealer } from "../../selectors/identity";
import { fetchAllDealInfo } from "../../reduxSlices/dealInfoSlice";
import { getDealReadableName } from "../../backendTypes/utils";
import DealSlider from "../../components/dealSlider/DealSlider";
import { selectAllNonClosedDealInfoList } from "../../selectors/dealInfo";
import DealLinkWithIcon from "../../components/links/DealLinkWithIcon";

interface DataType {
  key: number;
  deal: { name: string; serialId: number };
  currentAssetPrice: number;
  assetPriceChange: string;
  sharePrice: number;
  profitLossCap: number;
  multiplier: number;
}

const FETCH_ALL_DEAL_INFO_PERIOD_MS = 3000;

const NFT = () => {
  const { Text } = Typography;
  const [isCreateDealModalVisible, setIsCreateDealModalVisible] =
    useState(false);
  const dispatch = useAppDispatch();

  const isDealer = useAppSelector(selectIsDealer);
  const nonClosedDealInfo = useAppSelector(selectAllNonClosedDealInfoList);
  const headImg = require("../../assets/images/headimg.png");
  const dealInfoList = nonClosedDealInfo.map((singleDealInfo) => ({
    dealSerialId: singleDealInfo.serial_id,
    image: headImg,
    name: getDealReadableName(singleDealInfo),
    currentAssetPrice: 20.85,
    assetPriceChange: "+30.87%",
    sharePrice: singleDealInfo.share_price,
    profitLossCap: singleDealInfo.rate,
    multiplier: singleDealInfo.multiplier,
  }));

  const topOngoingTableColumns: ColumnsType<DataType> = [
    {
      title: "Deal",
      dataIndex: "deal",
      key: "deal",
      render: (deal: DataType["deal"]) => (
        <DealLinkWithIcon
          dealSerialId={deal.serialId}
          dealName={deal.name}
          iconSize={30}
        />
      ),
    },
    {
      title: "Current Asset Price",
      dataIndex: "currentAssetPrice",
      key: "currentAssetPrice",
    },
    {
      title: "Asset Price Change",
      dataIndex: "assetPriceChange",
      key: "assetPriceChange",
    },
    {
      title: "Share Price",
      dataIndex: "sharePrice",
      key: "sharePrice",
    },
    {
      title: "Profit/Loss Cap",
      dataIndex: "profitLossCap",
      key: "profitLossCap",
    },
    {
      title: "Multiplier",
      dataIndex: "multiplier",
      key: "multiplier",
    },
  ];

  useEffect(() => {
    const intervalId = setInterval(
      () => dispatch(fetchAllDealInfo),
      FETCH_ALL_DEAL_INFO_PERIOD_MS
    );
    return () => clearInterval(intervalId);
  }, [dispatch]);

  return (
    <div className={styles.home}>
      {isDealer && (
        <Button
          onClick={() => setIsCreateDealModalVisible(true)}
          type="primary"
        >
          Create a deal
        </Button>
      )}
      <Text className={styles.font1}>Top Ongoing table</Text>
      <Table
        className={styles["deal-table"]}
        pagination={{ hideOnSinglePage: true }}
        columns={topOngoingTableColumns}
        dataSource={dealInfoList.map((item, i) => {
          return {
            key: i,
            deal: { name: item.name, serialId: item.dealSerialId },
            currentAssetPrice: item.currentAssetPrice,
            assetPriceChange: item.assetPriceChange,
            sharePrice: item.sharePrice,
            profitLossCap: item.profitLossCap,
            multiplier: item.multiplier,
          };
        })}
      />
      <DealSlider dealInfoList={nonClosedDealInfo} />
      {isDealer && (
        <CreateDealModal
          isModalVisible={isCreateDealModalVisible}
          setIsModalVisible={setIsCreateDealModalVisible}
        />
      )}
    </div>
  );
};

export default NFT;
