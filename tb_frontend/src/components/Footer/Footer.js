import { Link } from "react-router-dom";
import React from "react";
import styles from "./index.module.css";
import intl from "react-intl-universal";

export default function Layout() {
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.left}>CONTACT INFO</div>
        <div className={styles.right}>
          <div className={styles.rightItem}>
            Email: masterSunDoctorNai@unicleChao.com
          </div>
          <div className={styles.rightItem}>phone: (999)999-9999</div>
        </div>
      </div>
    </div>
  );
}
