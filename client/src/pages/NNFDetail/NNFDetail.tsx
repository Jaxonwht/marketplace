import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { RightOutlined, EllipsisOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import * as echarts from "echarts";
import { Card } from "antd";

export default function LoginForm(props: any) {
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

  const [sliderLList, setSliderLList] = useState([
    {
      image: require("../../assets/images/d1.jpg").default,
      name: "NNN Name",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d1.jpg").default,
      name: "NNN Name",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d2.jpg").default,
      name: "NNN Name",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d1.jpg").default,
      name: "NNN Name",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d1.jpg").default,
      name: "NNN Name",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
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
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.containerWrapper}>
        <div className={styles.left}>
          <img
            className={styles.headimg}
            onClick={() => {}}
            src={require("../../assets/images/headimg.png").default}
            alt=""
          ></img>
          <Card title="INFO" style={{ width: 300, marginTop: 30 }}>
            <p>ansbanbadasdadasdada</p>
          </Card>
          <Card title="Create" style={{ width: 300, marginTop: 30 }}>
            <p>ansbanbadasdadasdada</p>
          </Card>
        </div>
        <div className={styles.dashboard}>
          <div className={styles.dashboardHeader}>
            <div style={{ fontSize: 30 }}>NAME</div>
            <div>Creter Name</div>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Floor Price</th>
                  <th>Current Price</th>
                  <th>Sold/Total</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>24HR Volume</th>
                </tr>
              </thead>
              {list.map((item, i) => (
                <tr onClick={() => {}}>
                  <td>{item.floorPrice}</td>
                  <td>{item.currentPrice}</td>
                  <td>
                    {item.sold}/{item.total}
                  </td>
                  <td>{item.startTime}</td>
                  <td>{item.endTime}</td>
                  <td>{item.hrVolume}</td>
                </tr>
              ))}
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
              <div className={styles.cardHeader}>Trading Volumne</div>
              <div id="lineChart2" className={styles.lineChart2}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.listContainer}>
        <img
          style={{ width: 30, height: 30 }}
          src={require("../../assets/images/left.jpg").default}
          alt=""
        ></img>
        <div className={styles.list}>
          {sliderLList.map((item) => (
            <div className={styles.listItem}>
              <img src={item.image} alt=""></img>
              <div className={styles.listItemImage}>{item.name}</div>
            </div>
          ))}
        </div>
        <img
          style={{ width: 30, height: 30 }}
          src={require("../../assets/images/right.jpg").default}
          alt=""
        ></img>
      </div>
    </div>
  );
}

LoginForm.propTypes = {
  login: PropTypes.func,
};
