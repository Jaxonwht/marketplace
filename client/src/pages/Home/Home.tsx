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
      name: "NNFF1",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF2",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF3",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF4",
    },
    {
      image: require("../../assets/images/headimg.png"),
      name: "NNFF5",
    },
  ]);
  useEffect(() => {
    // request().then((res)=>{
    //   setList(res);
    // })
  }, []);

  return (
    <div className={styles.home}>
      <div className={styles.homeTop}>
        <div className={styles.homeTopCaption}>AISSI</div>
        <div className={styles.homeTopDesc}>DISCOVER,PLAY,and Win</div>
      </div>
      <div
        style={{ padding: "100px 0px", textAlign: "center", fontSize: "40px" }}
      >
        CONTENT INTRODUCTION .......
      </div>
      <div className={styles.list}>
        {list.map((item) => (
          <div className={styles.listItem} key={item.name}>
            <img src={item.image} alt=""></img>
            <div className={styles.listItemImage}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
