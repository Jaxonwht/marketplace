import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./style.module.css";
import CreateDealModal from "./CreateDealModal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectIsDealer } from "../../selectors/identity";
import { fetchAllDealInfo } from "../../reduxSlices/dealInfoSlice";
import { getDealReadableName } from "../../backendTypes/utils";
import DealSlider from "../../components/dealSlider/DealSlider";
import { selectAllNonClosedDealInfo } from "../../selectors/dealInfo";

const NNF = () => {
  const navigate = useNavigate();
  const [isCreateDealModalVisible, setIsCreateDealModalVisible] =
    useState(false);
  const dispatch = useAppDispatch();

  const isDealer = useAppSelector(selectIsDealer);
  const nonClosedDealInfo = useAppSelector(selectAllNonClosedDealInfo);
  const headImg = require("../../assets/images/headimg.png");
  const dealInfoList = nonClosedDealInfo.map((singleDealInfo) => ({
    dealserialid: singleDealInfo.serial_id,
    image: headImg,
    name: getDealReadableName(singleDealInfo),
    price: 20.85,
    percent: "+30.87%",
    now: 27.29,
    multiplier: singleDealInfo.multiplier,
    cap: singleDealInfo.rate,
  }));

  useEffect(() => {
    dispatch(fetchAllDealInfo);
  }, [dispatch]);

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
          {dealInfoList.map((item) => (
            <tr
              key={item.dealserialid}
              style={{ borderBottom: "1px solid #aaa" }}
              onClick={() => {
                navigate(`/nnfdetail/${item.dealserialid}`);
              }}
            >
              <td style={{ fontWeight: "bold", fontSize: 20 }}>
                {item.dealserialid}
              </td>
              <td>
                <img style={{ width: 80 }} src={item.image} alt=""></img>
              </td>
              <td>{item.name}</td>
              <td>
                <span>
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
                />
                <span>{item.now}</span>
              </td>
              <td>
                <span>Capped at {item.cap * 100}%</span>
              </td>
              <td>
                <span>Multiplier: {item.multiplier}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DealSlider dealInfoList={nonClosedDealInfo} />
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
