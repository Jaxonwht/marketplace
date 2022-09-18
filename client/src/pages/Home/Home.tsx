import styles from "./style.module.css";
import { toSvg } from "jdenticon";
import GeneratedImage from "../../components/GeneratedImage";

const Home = () => {
  const featuredUsers = ["NNF1", "NNF2", "NNF3", "NNF4", "NNF5"];

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
