import React from "react";
import { Typography } from "antd";
import styles from "./index.module.scss";

const { Text, Title } = Typography;

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.left}>
          <Title level={3}>CONTACT INFO</Title>
        </div>
        <div className={styles.right}>
          <div>
            <Text> Email: </Text>
            <a
              href="mailto:masterSunDoctorNai@unicleChao.com"
              target="_blank"
              className={styles.email}
            >
              masterSunDoctorNai@unicleChao.com
            </a>
          </div>
          <Text>Phone: (999)999-9999</Text>
        </div>
      </div>
    </div>
  );
};

export default Footer;
