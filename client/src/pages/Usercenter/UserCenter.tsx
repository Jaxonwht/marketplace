import React, { useEffect, useState } from "react";
import { Button, Empty, Table, Typography } from "antd";
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
import { fetchMultipleAssetPrices } from "../../reduxSlices/assetPriceSlice";
import { shortenAddress } from "../../utils/address";
import { callAndSetInterval } from "../../utils/interval";

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
  const { Text } = Typography;
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
      return callAndSetInterval(
        () =>
          dispatch(
            fetchOwnershipSummary(
              identity.username,
              identity.account_type === AccountType.DEALER
            )
          ),
        ACCOUNT_INFO_REFRESH_MS
      );
    } else {
      const timeoutId = setTimeout(
        () => promptSignIn(3, () => navigate("/home")),
        200
      );
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, identity, navigate]);
  const ownershipSummary = useAppSelector((state) => state.ownershipSummary);
  const nonClosedDealInfo = useAppSelector(selectAllNonClosedDealInfo);
  useEffect(() => {
    dispatch(
      fetchMultipleAssetPrices(Object.keys(nonClosedDealInfo).map(Number))
    );
  }, [dispatch, nonClosedDealInfo]);
  let totalHeldValue = 0;
  const ownershipSummaryFormattedList = ownershipSummary.map(
    (ownershipForDeal) => {
      const dealInfo = nonClosedDealInfo[ownershipForDeal.deal_serial_id];
      totalHeldValue += dealInfo.share_price * ownershipForDeal.shares;
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
    if (!!identity) {
      return callAndSetInterval(
        () =>
          dispatch(
            fetchBalance(
              identity.username,
              identity.account_type === AccountType.DEALER
            )
          ),
        ACCOUNT_INFO_REFRESH_MS
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
      title:
        identity?.account_type === AccountType.DEALER
          ? "Outstanding Shares"
          : "Holding Shares",
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

  const currentAssetPrices = useAppSelector((state) => state.assetPrice);

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
        <Text strong style={{ fontSize: 20, marginTop: 10 }}>
          {shortenAddress(identity?.username) || "Unknown user"}
        </Text>
        <Text style={{ fontSize: 20, marginTop: 20 }}>
          Balance: {balance?.balance || 0}
        </Text>
        {balance?.lockup_balance && (
          <Text style={{ fontSize: 20, marginTop: 0 }}>
            Lock-up balance: {balance.lockup_balance}
          </Text>
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
            <Text strong>Participating</Text>
            <Text>Total Deal Balance: {totalHeldValue}</Text>
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
                  currentAssetPrice:
                    currentAssetPrices[item.dealSerialId] ??
                    "Unknown asset price",
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
