// components/layout.js
import React, { useEffect, useState } from "react";
import styles from "./style.module.css";
import { clear, getUser } from "../../utils/storage";
import {
  Link,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import intl from "react-intl-universal";

export default function Layout(props: any) {
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuSel, setMenuSel] = useState("");
  const [menus, setMenus] = useState([
    {
      name: intl.get("Dashboard"),
      icon: require("../../assets/images/dashboard.png").default,
      path: "dashboard",
      selected: true,
      id: 1,
    },
    // {
    //   name: intl.get("Security"),
    //   icon: require("../../assets/images/zhifubao.png").default,
    //   path: "security",
    //   selected: false,
    //   id: 2
    // },
    {
      name: intl.get("Identification"),
      icon: require("../../assets/images/validate.png").default,
      path: "identification",
      selected: false,
      id: 3,
    },
    {
      name: intl.get("Payment"),
      icon: require("../../assets/images/daifukuan.png").default,
      path: "payment",
      selected: false,
      id: 4,
    },
    // {
    //   name: intl.get("Referral"),
    //   icon: require("../../assets/images/tuijian.png").default,
    //   path: "referral",
    //   selected: false,
    //   id: 101
    // },
    // {
    //   name: intl.get("Reward Center"),
    //   icon: require("../../assets/images/jiangli.png").default,
    //   path: "rewardCenter",
    //   selected: false,
    //   id: 102
    // },
    // {
    //   name: intl.get("API Management"),
    //   icon: require("../../assets/images/kapian.png").default,
    //   path: "apiManagement",
    //   selected: false,
    //   id: 103
    // },
    {
      name: intl.get("Setting"),
      icon: require("../../assets/images/setting.png").default,
      path: "setting",
      selected: false,
      id: 5,
      children: [
        {
          name: intl.get("ProfileSetting"),
          icon: require("../../assets/images/setting.png").default,
          path: "profileSetting",
          selected: false,
          id: 6,
        },
        {
          name: intl.get("Security"),
          icon: require("../../assets/images/setting.png").default,
          path: "security",
          selected: false,
          id: 7,
        },
      ],
    },
  ]);

  console.log("params", location);
  useEffect(() => {
    if (location.pathname === "/usercenter") {
      console.log("redirext");
      navigate("dashboard");
    }
  }, []);

  if (user) {
  }
  return (
    <div className={styles.layout}>
      <div className={styles.menus}>
        {menus.map((item: any) => (
          <div className={`${styles.menuWrapper}`}>
            <div
              className={`${styles.menu} ${
                item.id === menuSel ? styles.selMenu : ""
              }`}
              onClick={() => {
                item.selected = true;
                setMenuSel(item.id);
                navigate(item.path);
              }}
            >
              <img className={styles.menuIcon} src={item.icon} alt=""></img>
              <span className={styles.menuName}>{item.name}</span>
            </div>
            <div className={styles.menuChildren}>
              {item.children &&
                item.children.map((it: any) => (
                  <div
                    className={`${styles.menuChildrenItem} ${
                      it.id === menuSel ? styles.selMenu : ""
                    }`}
                    onClick={() => {
                      it.selected = true;
                      setMenuSel(it.id);
                      navigate(it.path);
                    }}
                  >
                    <span className={styles.menuName}>{it.name}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.content}>
        <div className={styles.outletContent}>
          <Outlet></Outlet>
        </div>
      </div>
    </div>
  );
}
