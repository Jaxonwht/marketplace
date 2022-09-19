import { useNavigate } from "react-router-dom";
import GeneratedImage from "../GeneratedImage";
import styles from "./style.module.scss";

interface DealSliderItemProps {
  name: string;
  dealSerialId: number;
}

const DealSliderItem = ({ name, dealSerialId }: DealSliderItemProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles["list-item"]}
      key={dealSerialId}
      onClick={() => navigate(`/nnfdetail/${dealSerialId}`)}
    >
      <GeneratedImage
        generateSource={dealSerialId}
        alt={name}
        generateSize={100}
      />
      <div>{name}</div>
    </div>
  );
};

export default DealSliderItem;
