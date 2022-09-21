import styles from "./style.module.css";
import GeneratedImage from "../../components/generated_image/GeneratedImage";

export default function Home() {
  const featuredUsers = ["NNFF1", "NNFF2", "NNFF3", "NNFF4", "NNFF5"];

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
        {featuredUsers.map((user) => (
          <div className={styles.listItem}>
            <GeneratedImage
              generateSource={user}
              generateSize={120}
              alt={user}
            />
            <div className={styles.listItemImage}>{user}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
