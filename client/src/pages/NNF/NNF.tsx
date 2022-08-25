import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../../utils/request";

import intl from "react-intl-universal";

import styles from "./style.module.css";
import * as echarts from "echarts";
import { useSelector, useDispatch } from "react-redux";
import Item from "antd/lib/list/Item";
import CreateDealModal from "./CreateDealModal";

export default function Home() {
  const navagate = useNavigate();
  const [isCreateDealModalVisible, setIsCreateDealModalVisible] =
    useState(false);

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
  useEffect(() => {}, []);

  return (
    <div className={styles.home}>
      <button
        className="button"
        style={{ height: 60, width: 400 }}
        onClick={() => setIsCreateDealModalVisible(true)}
      >
        Create a deal
      </button>
      <div className={styles.font1}>Top Ongoing table</div>
      <table className={styles.table}>
        {list.map((item, i) => (
          <tr
            style={{ borderBottom: "1px solid #aaa" }}
            onClick={() => {
              navagate("/nnfdetail");
            }}
          >
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
      <CreateDealModal
        isModalVisible={isCreateDealModalVisible}
        setIsModalVisible={setIsCreateDealModalVisible}
      />
    </div>
  );
}
