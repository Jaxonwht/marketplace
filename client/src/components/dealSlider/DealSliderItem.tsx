import { useNavigate } from "react-router-dom";
import styles from "./style.module.scss";

interface DealSliderItemProps {
  imagePath: string;
  name: string;
  dealSerialId: number;
}

const DealSliderItem = ({
  imagePath,
  name,
  dealSerialId,
}: DealSliderItemProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles["list-item"]}
      key={dealSerialId}
      onClick={() => navigate(`/nnfdetail/${dealSerialId}`)}
    >
      <img
        src={imagePath}
        alt={name}
        className={styles["list-item__image"]}
      ></img>
      <div>{name}</div>
    </div>
  );
};

export default DealSliderItem;
