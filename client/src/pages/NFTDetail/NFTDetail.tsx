import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import styles from "./style.module.scss";
import { Card } from "antd";
import BuySharesModal from "./BuySharesModal";
import SellSharesModal from "./SellSharesModal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDealInfoForOneDeal } from "../../reduxSlices/dealInfoSlice";
import {
  selectAllNonClosedDealInfoList,
  selectDealInfoForSerialId,
} from "../../selectors/dealInfo";
import DealSlider from "../../components/dealSlider/DealSlider";
import { AccountType } from "../../reduxSlices/identitySlice";
import { fetchProfitDetail } from "../../reduxSlices/profitDetailSlice";
import { utcStringToLocalShort } from "../../utils/datetime";
import {
  openseaAssetLink,
  openseaCollectionLink,
  goerliScanLink,
  coinmarketcapLink,
} from "../../utils/link";
import GeneratedImage from "../../components/generated_image/GeneratedImage";
import DealInfoCard from "./DealInfoCard";
import { fetchAssetPriceHistory } from "../../reduxSlices/assetPriceHistorySlice";
import { fetchAssetSaleVolume } from "../../reduxSlices/assetSaleVolumeSlice";
import TradingEcharts from "../../components/graph/TradingEcharts";
import { fetchOneAssetPrice } from "../../reduxSlices/assetPriceSlice";
import { selectAssetPriceForDeal } from "../../selectors/assetPrice";
import moment from "moment";
import { FullscreenOutlined } from "@ant-design/icons";

interface DataType {
  key: number;
  boughtShares: number;
  purchaseTime: string;
  buyAssetPrice: number;
  profit: number;
}

const PROFIT_INFO_REFRESH_MS = 3000;

const NFTDetail = () => {
  const { Text } = Typography;
  const [isBuySharesModalVisible, setIsBuySharesModalVisible] = useState(false);
  const [isSellSharesModalVisible, setIsSellSharesModalVisible] =
    useState(false);
  const dispatch = useAppDispatch();
  const params = useParams();
  const dealSerialId =
    params.dealSerialId === undefined ? undefined : Number(params.dealSerialId);
  const nonClosedDealInfo = useAppSelector(selectAllNonClosedDealInfoList);
  const dealInfo = useAppSelector(selectDealInfoForSerialId(dealSerialId));
  const identity = useAppSelector((state) => state.identity);
  const isBuyer = identity?.account_type === AccountType.BUYER;
  useEffect(() => {
    if (dealSerialId !== undefined) {
      dispatch(fetchAssetPriceHistory(dealSerialId));
      dispatch(fetchAssetSaleVolume(dealSerialId));
      dispatch(fetchOneAssetPrice(dealSerialId));
    }
  }, [dispatch, dealSerialId]);
  useEffect(() => {
    if (dealSerialId !== undefined) {
      dispatch(fetchDealInfoForOneDeal(dealSerialId));
      if (!!identity) {
        const refreshProfitInfo = () =>
          dispatch(fetchProfitDetail(identity.username, dealSerialId));
        refreshProfitInfo();
        const id = setInterval(refreshProfitInfo, PROFIT_INFO_REFRESH_MS);
        return () => clearInterval(id);
      }
    }
  }, [dispatch, dealSerialId, identity]);
  const profitDetail = useAppSelector((state) => state.profitDetail);

  const [assetPriceTimes, assetHistoricalPrices] = useAppSelector(
    (state) => state.assetPriceHistory
  );
  const currentAssetPrice = useAppSelector(
    selectAssetPriceForDeal(dealSerialId)
  );
  let allAssetPriceTimes: string[];
  let allAssetHistoricalPrices: number[];
  if (currentAssetPrice === undefined) {
    allAssetHistoricalPrices = assetHistoricalPrices;
    allAssetPriceTimes = assetPriceTimes;
  } else {
    allAssetHistoricalPrices = [...assetHistoricalPrices, currentAssetPrice];
    allAssetPriceTimes = [...assetPriceTimes, moment.utc().format()];
  }
  const {
    timestamps: assetSaleVolumeTimes,
    saleCounts: assetSaleCounts,
    saleMoneyValues: assetSaleMoneyValues,
  } = useAppSelector((state) => state.assetSaleVolume);

  const profitDetailTableColumns: ColumnsType<DataType> = [
    {
      title: "Index",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Bought Shares",
      dataIndex: "boughtShares",
      key: "boughtShares",
    },
    {
      title: "Purchase Time",
      dataIndex: "purchaseTime",
      key: "purchaseTime",
    },
    {
      title: "Asset Price at Purchase",
      dataIndex: "buyAssetPrice",
      key: "buyAssetPrice",
    },
    {
      title: "Profit/Loss",
      dataIndex: "profit",
      key: "profit",
    },
  ];

  const hasStakes = profitDetail.length !== 0;

  const [pricesChartFullscreen, setPricesChartFullscreen] = useState(false);
  const [saleChartFullscreen, setSaleChartFullscreen] = useState(false);
  const pricesChart = (willShowInModal: boolean) => (
    <TradingEcharts
      className={willShowInModal ? undefined : styles.lineChart1}
      timeSeries={allAssetPriceTimes}
      moreDetails={willShowInModal}
      timeData={[allAssetHistoricalPrices]}
    />
  );
  const saleChart = (willShowInModal: boolean) => (
    <TradingEcharts
      className={willShowInModal ? undefined : styles.lineChart2}
      timeSeries={assetSaleVolumeTimes}
      timeData={[assetSaleCounts, assetSaleMoneyValues]}
      seriesLegends={["sale count", "sale money value"]}
      moreDetails={willShowInModal}
    />
  );

  return (
    <div className={styles.container}>
      <div className={styles.containerWrapper}>
        <div className={styles.left}>
          <GeneratedImage
            generateSize={300}
            generateSource={dealSerialId}
            alt={`Deal ${dealSerialId}`}
          />
          <DealInfoCard dealInfo={dealInfo} />
          <Card title="Transact" className={styles["narrow-window"]}>
            {isBuyer ? (
              <>
                <Button
                  block
                  onClick={() => setIsBuySharesModalVisible(true)}
                  type="primary"
                >
                  Buy Shares
                </Button>
                <Button
                  block
                  className={styles["sell-shares-button"]}
                  onClick={() => setIsSellSharesModalVisible(true)}
                  type="primary"
                >
                  Sell Shares
                </Button>
              </>
            ) : (
              <Text>Sign in as a buyer to transact</Text>
            )}
          </Card>
        </div>
        <div className={styles.dashboard}>
          {dealInfo ? (
            <>
              <div className={styles["dashboardHeader__main-header"]}>
                {`${dealInfo.is_nft_index ? "Index" : "Collection"}`} Name:{" "}
                {dealInfo.is_nft_index
                  ? coinmarketcapLink(dealInfo.collection_name)
                  : openseaCollectionLink(dealInfo.collection_name)}
              </div>
              {!!dealInfo.asset_id && (
                <div className={styles["dashboardHeader__sub-header"]}>
                  Asset ID:{" "}
                  {openseaAssetLink(dealInfo.collection_id, dealInfo.asset_id)}
                </div>
              )}
              <div>Dealer Address: {goerliScanLink(dealInfo.dealer_name)}</div>
            </>
          ) : (
            <Text>Unknown Deal</Text>
          )}
          <div className={styles.tableWrapper}>
            <Table
              className={styles.table}
              pagination={{ hideOnSinglePage: true }}
              columns={profitDetailTableColumns}
              dataSource={profitDetail.map((item, i) => {
                return {
                  key: i + 1,
                  boughtShares: item.shares,
                  purchaseTime: utcStringToLocalShort(item.buy_timestamp),
                  buyAssetPrice: item.buy_asset_price,
                  profit: Number(item.profit.toFixed(3)),
                };
              })}
              summary={(profitDetailTableData) => {
                if (!hasStakes) {
                  return null;
                }
                let totalBoughtShares = 0;
                let totalProfit = 0;

                profitDetailTableData.forEach(({ boughtShares, profit }) => {
                  totalBoughtShares += boughtShares;

                  totalProfit += profit;
                });
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {totalBoughtShares}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        {totalProfit}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
              footer={() =>
                hasStakes
                  ? "Your stakes in this deal"
                  : "You have no stake in this deal"
              }
            />
          </div>
          <div className={styles.dashboardContent}>
            <div
              className={styles.card}
              style={{
                marginRight: 20,
              }}
            >
              <div className={styles.cardHeader}>
                NFT Price
                <FullscreenOutlined
                  className={styles["fullscreen-icon"]}
                  style={{ color: "gray" }}
                  onClick={() => setPricesChartFullscreen(true)}
                />
              </div>
              {pricesChart(false)}
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                Trading Volume
                <FullscreenOutlined
                  className={styles["fullscreen-icon"]}
                  style={{ color: "gray" }}
                  onClick={() => setSaleChartFullscreen(true)}
                />
              </div>
              {saleChart(false)}
            </div>
          </div>
        </div>
      </div>
      <DealSlider dealInfoList={nonClosedDealInfo} />
      <BuySharesModal
        dealSerialIdPrepopulated={dealSerialId}
        isModalVisible={isBuySharesModalVisible}
        setIsModalVisible={setIsBuySharesModalVisible}
      />
      <SellSharesModal
        dealSerialIdPrepopulated={dealSerialId}
        isModalVisible={isSellSharesModalVisible}
        setIsModalVisible={setIsSellSharesModalVisible}
      />
      <Modal
        title="NFT Price"
        visible={pricesChartFullscreen}
        onOk={() => setPricesChartFullscreen(false)}
        onCancel={() => setPricesChartFullscreen(false)}
        width={1200}
      >
        {pricesChart(true)}
      </Modal>
      <Modal
        title="NFT Price"
        visible={saleChartFullscreen}
        onOk={() => setSaleChartFullscreen(false)}
        onCancel={() => setSaleChartFullscreen(false)}
        width={1200}
      >
        {saleChart(true)}
      </Modal>
    </div>
  );
};

export default NFTDetail;
