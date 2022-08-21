import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../../utils/request";

import intl from "react-intl-universal";

import styles from "./style.module.css";
import * as echarts from "echarts";
import { useSelector, useDispatch } from "react-redux";

export default function Home() {
  const [list, setList] = useState([
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF",
    },
  ]);
  useEffect(() => {}, []);

  return (
    <div className={styles.home}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.homeTopCaption}>A NEW WAY OF NFT</div>
          <p className={styles.topDesc}>
            ADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKA
            ADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDK
            AADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKA
            ADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKA
            ADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKA
            ADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKAADDSKLDKA
          </p>
        </div>
        <div>
          <img
            style={{ width: 600, height: 600, objectFit: "contain" }}
            src={require("../../assets/images/nnf.jpg")}
            alt=""
          ></img>
        </div>
      </div>
      <div className={styles.list}>
        {list.map((item) => (
          <div className={styles.listItem}>
            <img src={item.image} alt=""></img>
            <div className={styles.listItemImage}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
