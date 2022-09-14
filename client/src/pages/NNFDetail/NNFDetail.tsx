import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, List } from "antd";
import { RightOutlined, EllipsisOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./style.module.scss";
import * as echarts from "echarts";
import { Card } from "antd";
import BuySharesModal from "./BuySharesModal";
import SellSharesModal from "./SellSharesModal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDealInfoForOneDeal } from "../../reduxSlices/dealInfoSlice";
import {
  selectAllNonClosedDealInfoList,
  selectDealInfoForSerialId,
} from "../../selectors/dealInfo";
import { getDealReadableName } from "../../backendTypes/utils";
import DealSliderItem from "../../components/dealSlider/DealSliderItem";
import DealSlider from "../../components/dealSlider/DealSlider";
import { AccountType } from "../../reduxSlices/identitySlice";
import classNames from "classnames";
import { fetchProfitDetail } from "../../reduxSlices/profitDetailSlice";
import { utcStringToLocalShort } from "../../utils/datetime";
import {
  openseaAssetLink,
  openseaCollectionLink,
  goerliScanLink,
} from "../../utils/link";
import { reduceByField } from "../../utils/array";

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

  const [list, setList] = useState([
    {
      floorPrice: 10.0,
      currentPrice: 13.0,
      sold: 25,
      total: 70,
      startTime: "04/18/2022 11:00 AM",
      endTime: "05/18/2022 11:00 AM",
      hrVolume: 20,
    },
  ]);

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

  const hasStakes = profitDetail.length !== 0;

  return (
    <div className={styles.container}>
      <div className={styles.containerWrapper}>
        <div className={styles.left}>
          <img
            className={styles.headimg}
            onClick={() => {}}
            src={require("../../assets/images/headimg.png")}
            alt=""
          ></img>
          <Card title="INFO" className={styles["narrow-window"]}>
            {!!dealInfo ? (
              <React.Fragment>
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
              </React.Fragment>
            ) : (
              <div>Unknown Deal??</div>
            )}
          </Card>
          <Card title="Transact" className={styles["narrow-window"]}>
            {isBuyer ? (
              <React.Fragment>
                <button
                  className="button"
                  onClick={() => setIsBuySharesModalVisible(true)}
                >
                  Buy Shares
                </button>
                <button
                  className={classNames("button", styles["sell-shares-button"])}
                  onClick={() => setIsSellSharesModalVisible(true)}
                >
                  Sell Shares
                </button>
              </React.Fragment>
            ) : (
              <div>Log in as a buyer to transact</div>
            )}
          </Card>
        </div>
        <div className={styles.dashboard}>
          {dealInfo ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : (
            "Unknown Deal"
          )}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption>
                {hasStakes
                  ? "Your stakes in this deal"
                  : "You don't have a stake in this deal"}
              </caption>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Bought Shares</th>
                  <th>Purchase Time</th>
                  <th>Asset Price at Purchase</th>
                  <th>Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {profitDetail.map((profitBreakdown, index) => (
                  <tr key={profitBreakdown.buy_timestamp}>
                    <td>{index + 1}</td>
                    <td>{profitBreakdown.shares}</td>
                    <td>
                      {utcStringToLocalShort(profitBreakdown.buy_timestamp)}
                    </td>
                    <td>{profitBreakdown.buy_asset_price}</td>
                    <td>{profitBreakdown.profit.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot
                className={
                  styles[`table__footer${hasStakes ? "--has-stakes" : ""}`]
                }
              >
                <tr>
                  <td>Total</td>
                  <td>
                    {reduceByField(
                      profitDetail,
                      "shares",
                      (partialSum, shares) => partialSum + shares,
                      0
                    )}
                  </td>
                  <td />
                  <td />
                  <td>
                    {reduceByField(
                      profitDetail,
                      "profit",
                      (partialSum, profit) => partialSum + profit,
                      0
                    ).toFixed(3)}
                  </td>
                </tr>
              </tfoot>
            </table>
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
