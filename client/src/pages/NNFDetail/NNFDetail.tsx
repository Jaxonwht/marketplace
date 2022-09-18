import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import styles from "./style.module.scss";
import { Card } from "antd";
import * as echarts from "echarts";
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
} from "../../utils/link";
import GeneratedImage from "../../components/GeneratedImage";

interface DataType {
  key: number;
  boughtShares: number;
  purchaseTime: string;
  buyAssetPrice: number;
  profit: number;
}

const NNFDetail = () => {
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
      dispatch(fetchDealInfoForOneDeal(dealSerialId));
      if (!!identity) {
        dispatch(fetchProfitDetail(identity.username, dealSerialId));
      }
    }
  }, [dispatch, dealSerialId, identity]);
  const profitDetail = useAppSelector((state) => state.profitDetail);

  useEffect(() => {
    loadChart1();
    loadChart2();
  }, []);

  const loadChart1 = async () => {
    var chartDom: any = document.getElementById("lineChart1");
    var myChart = echarts.init(chartDom);
    var option;

    option = {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          symbol: "none",
          data: [150, 230, 224, 218, 135, 147, 2260],
          type: "line",
        },
      ],
    };

    option && myChart.setOption(option);
  };

  const loadChart2 = async () => {
    var chartDom: any = document.getElementById("lineChart2");
    var myChart = echarts.init(chartDom);
    var option;

    option = {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          symbol: "none",
          data: [150, 230, 224, 518, 135, 147, 260],
          type: "line",
        },
      ],
    };

    option && myChart.setOption(option);
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.containerWrapper}>
        <div className={styles.left}>
          <GeneratedImage
            generateSize={300}
            generateSource={dealSerialId}
            alt={`Deal ${dealSerialId}`}
          />
          <Card title="INFO" className={styles["narrow-window"]}>
            {!!dealInfo ? (
              <>
                <div>Profit/Loss Cap: {dealInfo.rate * 100}%</div>
                <div>Multiplier: {dealInfo.multiplier}</div>
                {
                  // TODO ZIYI
                }
                <div>Current Asset Price: 0.5</div>
                <div>
                  Start Time: {utcStringToLocalShort(dealInfo.start_time)}
                </div>
                <div>End Time: {utcStringToLocalShort(dealInfo.end_time)}</div>
                <div>Share Price: {dealInfo.share_price}</div>
                <div>Shares Remaining: {dealInfo.shares_remaining}</div>
              </>
            ) : (
              <div>Unknown Deal??</div>
            )}
          </Card>
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
              <div>Log in as a buyer to transact</div>
            )}
          </Card>
        </div>
        <div className={styles.dashboard}>
          {dealInfo ? (
            <>
              <div className={styles["dashboardHeader__main-header"]}>
                Collection Name:{" "}
                {openseaCollectionLink(dealInfo.collection_name)}
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
            "Unknown Deal"
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
                  profit: item.profit,
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
              <div className={styles.cardHeader}>NFT Price</div>
              <div id="lineChart1" className={styles.lineChart1}></div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>Trading Volume</div>
              <div id="lineChart2" className={styles.lineChart2}></div>
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
    </div>
  );
};

export default NNFDetail;
