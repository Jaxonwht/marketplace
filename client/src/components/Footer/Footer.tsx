import React from "react";
import { Typography } from "antd";
import styles from "./index.module.scss";

const { Text } = Typography;

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.left}>
          <Text>CONTACT INFO</Text>
        </div>
        <div className={styles.right}>
          <div>
            <Text> Email: </Text>
            <a
              href="mailto:contact@aissi.com"
              target="_blank"
              className={styles.email}
            >
              contact@aissi.com
            </a>
          </div>
          <Text>Phone: (999) 999-9999</Text>
        </div>
      </div>
    </div>
  );
};

export default Footer;
