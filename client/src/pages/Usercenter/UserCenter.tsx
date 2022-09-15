import React, { ChangeEvent, useEffect, useState } from "react";
import { Form, Input, Button, message, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
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

interface DataType {
  key: number;
  deal: { name: string; serialId: number };
  holdingShares: number;
  profit: string;
  profitPercentage: string;
  currentAssetPrice: number;
}

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

  const participatingDealTableColumns: ColumnsType<DataType> = [
    {
      title: "Deal",
      dataIndex: "deal",
      key: "deal",
      render: (deal) => (
        <Link to={`/nnfdetail/${deal.serialId}`}>{deal.name}</Link>
      ),
    },
    {
      title: "Holding Shares",
      dataIndex: "holdingShares",
      key: "holdingShares",
    },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
    },
    {
      title: "Profit Percentage",
      dataIndex: "profitPercentage",
      key: "profitPercentage",
    },
    {
      title: "Current Asset Price",
      dataIndex: "currentAssetPrice",
      key: "currentAssetPrice",
    },
  ];

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
        <Button
          onClick={() => {
            setIsAddBalanceModalVisible(true);
          }}
          type="primary"
        >
          Add Balance
        </Button>
        <Button
          onClick={() => {
            setIsWithdrawModalVisible(true);
          }}
          type="primary"
        >
          Cash out
        </Button>
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
            <Table
              pagination={{ hideOnSinglePage: true }}
              columns={participatingDealTableColumns}
              dataSource={ownershipSummaryFormattedList.map((item, i) => {
                return {
                  key: i,
                  deal: { name: item.name, serialId: item.dealSerialId },
                  holdingShares: item.shares,
                  profit: item.profit,
                  profitPercentage: item.profitPercentage,
                  // TODO: ZIYI!!
                  currentAssetPrice: 0.5,
                };
              })}
            />
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
