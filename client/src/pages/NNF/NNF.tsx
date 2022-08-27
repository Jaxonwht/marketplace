import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../../utils/request";

import intl from "react-intl-universal";

import styles from "./style.module.css";
import * as echarts from "echarts";
import { useSelector, useDispatch } from "react-redux";
import Item from "antd/lib/list/Item";
import CreateDealModal from "./CreateDealModal";
import { useAppSelector } from "../../store/hooks";
import { selectIsDealer } from "../../selectors/identity";

const NNF = () => {
  const navagate = useNavigate();
  const [isCreateDealModalVisible, setIsCreateDealModalVisible] =
    useState(false);

  const isDealer = useAppSelector(selectIsDealer);

  const [list, setList] = useState([
    {
      image: require("../../assets/images/headimg.png"),
      name: "Floor Price1",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "Floor Price2",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "Floor Price3",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "Floor Price4",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "Floor Price5",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "Floor Price6",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "Floor Price7",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
  ]);

  const [sliderLList, setSliderLList] = useState([
    {
      image: require("../../assets/images/d1.jpg"),
      name: "NNN Name1",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d1.jpg"),
      name: "NNN Name2",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d2.jpg"),
      name: "NNN Name3",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d1.jpg"),
      name: "NNN Name4",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
    {
      image: require("../../assets/images/d1.jpg"),
      name: "NNN Name5",
      price: 20.85,
      percent: "+30.87%",
      now: 27.29,
    },
  ]);
  useEffect(() => {}, []);

  return (
    <div className={styles.home}>
      {isDealer && (
        <button
          className="button"
          style={{ height: 60, width: 400 }}
          onClick={() => setIsCreateDealModalVisible(true)}
        >
          Create a deal
        </button>
      )}
      <div className={styles.font1}>Top Ongoing table</div>
      <table className={styles.table}>
        <tbody>
          {list.map((item, i) => (
            <tr
              key={item.name}
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
                    src={require("../../assets/images/bi.png")}
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
                  src={require("../../assets/images/bi.png")}
                  alt=""
                ></img>
                <span>{item.now}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.listContainer}>
        <img
          style={{ width: 30, height: 30 }}
          src={require("../../assets/images/left.jpg")}
          alt=""
        ></img>
        <div className={styles.list}>
          {sliderLList.map((item) => (
            <div key={item.name} className={styles.listItem}>
              <img src={item.image} alt=""></img>
              <div className={styles.listItemImage}>{item.name}</div>
            </div>
          ))}
        </div>
        <img
          style={{ width: 30, height: 30 }}
          src={require("../../assets/images/right.jpg")}
          alt=""
        ></img>
      </div>
      {isDealer && (
        <CreateDealModal
          isModalVisible={isCreateDealModalVisible}
          setIsModalVisible={setIsCreateDealModalVisible}
        />
      )}
    </div>
  );
};

export default NNF;
