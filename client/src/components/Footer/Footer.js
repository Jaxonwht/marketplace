import { Space, Typography } from "antd";
import React from "react";
import styles from "./index.module.css";
import intl from "react-intl-universal";

const { Text, Link, Title } = Typography;

export default function Layout() {
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.left}>
          <Title level={3}>CONTACT INFO</Title>
        </div>
        <div className={styles.right}>
          <div className={styles.rightItem}>
            <Text> Email: </Text>
            <Link
              href="mailto:masterSunDoctorNai@unicleChao.com"
              target="_blank"
            >
              masterSunDoctorNai@unicleChao.com
            </Link>
          </div>
          <div className={styles.rightItem}>
            <Text>Phone: (999)999-9999</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
