import React, { useEffect, useState } from "react";
import { Button, Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import styles from "./style.module.scss";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBalance } from "../../reduxSlices/balanceSlice";
import {
  AccountType,
  refreshSignInStatus,
} from "../../reduxSlices/identitySlice";
import AddBalanceConfirmationModal from "./AddBalanceConfirmationModal";
import WithdrawConfirmationModal from "./WithdrawConfirmationModal";
import { fetchOwnershipSummary } from "../../reduxSlices/ownershipSummarySlice";
import { fetchAllDealInfo } from "../../reduxSlices/dealInfoSlice";
import { selectAllNonClosedDealInfo } from "../../selectors/dealInfo";
import { getDealReadableName } from "../../backendTypes/utils";
import GeneratedImage from "../../components/generated_image/GeneratedImage";
import DealLinkWithIcon from "../../components/links/DealLinkWithIcon";
import { promptSignIn } from "../../components/error/promptSignIn";

interface DataType {
  key: number;
  deal: { name: string; serialId: number };
  holdingShares: number;
  profit: string;
  profitPercentage: string;
  currentAssetPrice: number;
}

const ACCOUNT_INFO_REFRESH_MS = 3000;

const UserCenter = () => {
  const [isAddBalanceModalVisible, setIsAddBalanceModalVisible] =
    useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const identity = useAppSelector((state) => state.identity);
  const balance = useAppSelector((state) => state.balance);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(refreshSignInStatus);
    dispatch(fetchAllDealInfo);
  }, [dispatch]);
  const navigate = useNavigate();
  useEffect(() => {
    if (!!identity) {
      const refreshOwnershipSummary = () =>
        dispatch(
          fetchOwnershipSummary(
            identity.username,
            identity.account_type === AccountType.DEALER
          )
        );
      refreshOwnershipSummary();
      const id = setInterval(refreshOwnershipSummary, ACCOUNT_INFO_REFRESH_MS);
      return () => clearInterval(id);
    } else {
      const timeoutId = setTimeout(
        () => promptSignIn(3, () => navigate("/home")),
        200
      );
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, identity]);
  const ownershipSummary = useAppSelector((state) => state.ownershipSummary);
  const nonClosedDealInfo = useAppSelector(selectAllNonClosedDealInfo);
  const ownershipSummaryFormattedList = ownershipSummary.map(
    (ownershipForDeal) => {
      const dealInfo = nonClosedDealInfo[ownershipForDeal.deal_serial_id];
      return {
        dealSerialId: ownershipForDeal.deal_serial_id,
        name: dealInfo ? getDealReadableName(dealInfo) : "Unknown Deal",
        shares: ownershipForDeal.shares,
        profit: ownershipForDeal.profit.toFixed(3),
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
      render: (deal: DataType["deal"]) => (
        <DealLinkWithIcon
          dealSerialId={deal.serialId}
          dealName={deal.name}
          iconSize={30}
        />
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

  if (!identity) {
    return <Empty />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <GeneratedImage
          generateSize={120}
          generateSource={identity?.username}
          alt={identity?.username}
        />
        <div style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
          {identity?.username?.substring(0, 10) || "Unknown user"}
        </div>
        <div style={{ fontSize: 20, marginTop: 20 }}>
          Balance: {balance?.balance || 0}
        </div>
        {balance?.lockup_balance && (
          <div style={{ fontSize: 20, marginTop: 0 }}>
            Lock-up balance: {balance.lockup_balance}
          </div>
        )}
        <Button
          className={styles["add-balance-button"]}
          onClick={() => {
            setIsAddBalanceModalVisible(true);
          }}
          type="primary"
        >
          Add Balance
        </Button>
        <Button
          className={styles["cash-out-button"]}
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
              className={styles.table}
              pagination={{ hideOnSinglePage: true }}
              columns={participatingDealTableColumns}
              dataSource={ownershipSummaryFormattedList.map((item) => {
                return {
                  key: item.dealSerialId,
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
