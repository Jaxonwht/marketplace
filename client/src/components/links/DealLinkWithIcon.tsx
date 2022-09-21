import { Link } from "react-router-dom";
import GeneratedImage from "../generated_image/GeneratedImage";
import styles from "./styles.module.scss";

interface DealLinkWithIconProps {
  readonly dealSerialId: number;
  readonly dealName: string;
  readonly iconSize: number;
}

const DealLinkWithIcon = ({
  dealSerialId,
  dealName,
  iconSize,
}: DealLinkWithIconProps) => {
  return (
    <div className={styles["link-icon-wrapper"]}>
      <Link to={`/nnfdetail/${dealSerialId}`}>{dealName}</Link>
      <GeneratedImage generateSource={dealSerialId} generateSize={iconSize} />
    </div>
  );
};

export default DealLinkWithIcon;
