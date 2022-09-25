import styles from "./style.module.scss";
import GeneratedImage from "../../components/generated_image/GeneratedImage";
import { Dropdown, Select, Avatar, Typography } from "antd";

const Home = () => {
  const featuredUsers = ["NFT1", "NFT2", "NFT3", "NFT4", "NFT5"];
  const { Text } = Typography;

  return (
    <div className={styles.home}>
      <div className={styles.homeTop}>
        <Text className={styles.homeTopCaption}>AISSI</Text>
        <div className={styles.homeTopDesc}>
          <Text>Play, Pledge and Win</Text>
        </div>
        <div className={styles.homeTopDesc}>
          <Text>NFT Derivatives for everyone.</Text>
        </div>
      </div>
      <div
        style={{ padding: "100px 0px", textAlign: "center", fontSize: "20px" }}
      >
        <Text>
          Aissi is an inclusive platform that enables everyone to participate in
          rise and fall of the whole NFT market or a single NFT’s average
          prices.
        </Text>
      </div>
      <div
        style={{ padding: "100px 0px", textAlign: "center", fontSize: "20px" }}
      >
        <Text>
          Introducing 2 products: NFT Spot Contract & NFT Index Perpetual
        </Text>
      </div>
      <div className={styles.list}>
        {featuredUsers.map((user) => (
          <div className={styles.listItem} key={user}>
            <GeneratedImage
              alt={user}
              generateSource={user}
              generateSize={120}
            />
            <div className={styles.listItemImage}>{user}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
