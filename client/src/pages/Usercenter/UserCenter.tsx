import React, { ChangeEvent, useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { RightOutlined, EllipsisOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import styles from "./style.module.scss";
import * as echarts from "echarts";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBalance } from "../../reduxSlices/balanceSlice";
import { AccountType } from "../../reduxSlices/identitySlice";
import AddBalanceConfirmationModal from "./AddBalanceConfirmationModal";
import WithdrawConfirmationModal from "./WithdrawConfirmationModal";
import { fetchOnwershipSummary } from "../../reduxSlices/ownershipSummarySlice";
import { fetchAllDealInfo } from "../../reduxSlices/dealInfoSlice";
import {
  selectAllNonClosedDealInfo,
  selectDealInfoForSerialId,
} from "../../selectors/dealInfo";
import { getDealReadableName } from "../../backendTypes/utils";

const UserCenter = () => {
  const [accounts, setAccounts] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isAddBalanceModalVisible, setIsAddBalanceModalVisible] =
    useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const identity = useAppSelector((state) => state.identity);
  const balance = useAppSelector((state) => state.balance);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchAllDealInfo);
  }, [dispatch]);
  useEffect(() => {
    if (!!identity) {
      dispatch(fetchOnwershipSummary(identity.username));
    }
  }, [dispatch, identity]);
  const ownershipSummary = useAppSelector((state) => state.ownershipSummary);
  const nonClosedDealInfo = useAppSelector(selectAllNonClosedDealInfo);
  const ownershipSummaryFormattedList = ownershipSummary.map(
    (ownershipForDeal) => {
      const dealInfo = nonClosedDealInfo[ownershipForDeal.deal_serial_id];
      return {
        dealSerialId: ownershipForDeal.deal_serial_id,
        image: require("../../assets/images/headimg.png"),
        name: dealInfo ? getDealReadableName(dealInfo) : "Unknown Deal",
        shares: ownershipForDeal.shares,
        profit: ownershipForDeal.profit.toFixed(),
        profitPercentage: `${(ownershipForDeal.profit_ratio * 100).toFixed(
          3
        )}%`,
      };
    }
  );

  useEffect(() => {
    if (identity) {
      dispatch(
        fetchBalance(
          identity.username,
          identity.account_type === AccountType.DEALER
        )
      );
    }
  }, [dispatch, identity]);

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img
          className={styles.headimg}
          onClick={() => {}}
          src={require("../../assets/images/headimg.png")}
          alt=""
        ></img>
        <div style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
          {identity?.username?.substring(0, 10) || "Unknown user"}
        </div>
        <div style={{ fontSize: 20, marginTop: 20 }}>
          Balance: {balance?.balance || "Unknown balance"}
        </div>
        {balance?.lockup_balance && (
          <div style={{ fontSize: 10, marginTop: -5 }}>
            Lock-up balance: {balance.lockup_balance}
          </div>
        )}
        <button
          className="button"
          style={{ width: 200, marginTop: 20 }}
          onClick={() => {
            setIsAddBalanceModalVisible(true);
          }}
        >
          ADD BALANCE
        </button>
        <button
          className="button"
          style={{ width: 200, marginTop: 20 }}
          onClick={() => {
            setIsWithdrawModalVisible(true);
          }}
        >
          CASH OUT
        </button>
      </div>

      <div className={styles.dashboard}>
        <div
          className={styles.card}
          style={{
            marginRight: 20,
          }}
        >
          <div className={styles.cardHeader}>
            <div style={{ fontWeight: "bold" }}>Participating</div>
            <div>Total Deal Balance: 10.89</div>
          </div>

          <div className={styles.listContainer}>
            <img
              style={{
                width: 30,
                height: 30,
                marginLeft: -15,
                position: "relative",
                zIndex: 10,
              }}
              src={require("../../assets/images/left.jpg")}
              alt=""
            ></img>
            <table className={styles.table}>
              <thead>
                <tr>
                  <td>Deal</td>
                  <td>Holding Shares</td>
                  <td>Profit</td>
                  <td>Profit Percentage</td>
                  <td>Current Asset Price</td>
                </tr>
              </thead>
              <tbody>
                {ownershipSummaryFormattedList.map((item, i) => (
                  <tr key={item.dealSerialId}>
                    <td
                      onClick={() =>
                        navigate(`/nnfdetail/${item.dealSerialId}`)
                      }
                      className={styles["table__deal-identifier"]}
                    >
                      <img style={{ width: 80 }} src={item.image} alt=""></img>
                      <span>{item.name}</span>
                    </td>
                    <td>{item.shares}</td>
                    <td>
                      <span>
                        <img
                          style={{ width: 20, height: 20 }}
                          src={require("../../assets/images/bi.png")}
                          alt=""
                        ></img>
                        {item.profit}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#ff7000" }}>
                        {item.profitPercentage}
                      </span>
                    </td>
                    <td>
                      <img
                        style={{ width: 20, height: 20 }}
                        src={require("../../assets/images/bi.png")}
                        alt=""
                      ></img>
                      <span>TODO ZIYI</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <img
              style={{
                width: 30,
                height: 30,
                marginRight: -15,
                position: "relative",
                zIndex: 1,
              }}
              src={require("../../assets/images/right.jpg")}
              alt=""
            ></img>
          </div>
        </div>
      </div>
      <AddBalanceConfirmationModal
        isModalVisible={isAddBalanceModalVisible}
        setIsModalVisible={setIsAddBalanceModalVisible}
      />
      <WithdrawConfirmationModal
        isModalVisible={isWithdrawModalVisible}
        setIsModalVisible={setIsWithdrawModalVisible}
      />
    </div>
  );
};

export default UserCenter;
