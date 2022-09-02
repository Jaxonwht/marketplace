import type { DealInfo } from "../../backendTypes/index";
import { getDealReadableName } from "../../backendTypes/utils";
import DealSliderItem from "./DealSliderItem";
import styles from "./style.module.scss";

interface DealSliderProps {
  dealInfoList: DealInfo[];
}

const DealSlider = ({ dealInfoList }: DealSliderProps) => {
  const dealInfoSliderList = Object.values(dealInfoList).map(
    (singleDealInfo) => ({
      dealSerialId: singleDealInfo.serial_id,
      image: require("../../assets/images/d1.jpg"),
      name: getDealReadableName(singleDealInfo),
    })
  );
  return (
    <div className={styles["list-container"]}>
      <img
        className={styles["list-arrow"]}
        src={require("../../assets/images/left.jpg")}
        alt="left-arrow"
      ></img>
      <div className={styles.list}>
        {dealInfoSliderList.map((item) => (
          <DealSliderItem
            key={item.dealSerialId}
            imagePath={item.image}
            name={item.name}
            dealSerialId={item.dealSerialId}
          />
        ))}
      </div>
      <img
        className={styles["list-arrow"]}
        src={require("../../assets/images/right.jpg")}
        alt="right-arrow"
      ></img>
    </div>
  );
};

export default DealSlider;