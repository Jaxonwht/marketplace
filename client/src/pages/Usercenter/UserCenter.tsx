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

export default function LoginForm(props: any) {
  const [accounts, setAccounts] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isAddBalanceModalVisible, setIsAddBalanceModalVisible] =
    useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const identity = useAppSelector((state) => state.identity);
  const balance = useAppSelector((state) => state.balance);
  const dispatch = useAppDispatch();
  const [list, setList] = useState([
    {
      image: require("../../assets/images/headimg.png").default,
      name: "Floor Price",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png").default,
      name: "Floor Price",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png").default,
      name: "Floor Price",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png").default,
      name: "Floor Price",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png").default,
      name: "Floor Price",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png").default,
      name: "Floor Price",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png").default,
      name: "Floor Price",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
  ]);

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
          src={require("../../assets/images/headimg.png").default}
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
          ADD BANLANCE
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
            <div>Total Deal Banlace: 10.89</div>
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
              src={require("../../assets/images/left.jpg").default}
              alt=""
            ></img>
            <table className={styles.table}>
              {list.map((item, i) => (
                <tr onClick={() => {}}>
                  <td style={{ fontWeight: "bold", fontSize: 20 }}>{i + 1}</td>
                  <td>
                    <img style={{ width: 80 }} src={item.image} alt=""></img>
                  </td>
                  <td>
                    <span>
                      {item.name}:
                      <img
                        style={{ width: 20, height: 20 }}
                        src={require("../../assets/images/bi.png").default}
                        alt=""
                      ></img>
                      {item.price}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: "#ff7000" }}>{item.percent}</span>
                  </td>
                  <td>
                    <img
                      style={{ width: 20, height: 20 }}
                      src={require("../../assets/images/bi.png").default}
                      alt=""
                    ></img>
                    <span>{item.now}</span>
                  </td>
                </tr>
              ))}
            </table>
            <img
              style={{
                width: 30,
                height: 30,
                marginRight: -15,
                position: "relative",
                zIndex: 1,
              }}
              src={require("../../assets/images/right.jpg").default}
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
}
