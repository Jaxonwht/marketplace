import React from "react";
import { Typography } from "antd";
import styles from "./index.module.scss";

const Footer = () => {
  const { Text, Link } = Typography;
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <Text className={styles.left}>CONTACT INFO</Text>
        <div className={styles.right}>
          <div>
            <Text> Email: </Text>
            <Link
              href="mailto:contact@aissi.com"
              target="_blank"
              className={styles.email}
            >
              contact@aissi.com
            </Link>
          </div>
          <Text>Phone: (999) 999-9999</Text>
        </div>
      </div>
    </div>
  );
};

export default Footer;
