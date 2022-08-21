// components/layout.js
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { clear, getUser } from "../../utils/storage";
import MyMenu from "../Menu/Menu";
import Theme from "../../config/theme";

import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Menu, Switch } from "antd";
import intl from "react-intl-universal";
import { useSelector, useDispatch } from "react-redux";
import { isMobile } from "../../utils/utils";
import { MenuOutlined } from "@ant-design/icons";
import { request } from "http";

export default function Layout() {
  const [navBg, setNavBg] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  let theme = useSelector((state: any) => state.theme);

  const user = getUser();
  console.log("user2222", user);
  if (user) {
  }

  useEffect(() => {
    window.onscroll = function () {
      let scrollPos = window.scrollY;
      if (scrollPos > 50) {
        setNavBg(true);
      } else {
        setNavBg(false);
      }
    };
    window.onresize = function () {
      dispatch({
        type: "SETISMOBILE",
        payload: {
          isMobile: isMobile(),
        },
      });
    };
  }, []);

  const navagate = useNavigate();

  return (
    <div className={`${styles.header} ${navBg ? styles.navBg : ""}`}>
      <div className={styles.headerContent}>
        <Link to={"/home"}>
          <div className={styles.caption} style={{ cursor: "pointer" }}>
            <img
              alt=""
              className={styles.logo}
              src={require("../../assets/images/logo.jpg")}
            ></img>
            IIASS
          </div>
        </Link>
        <div className={styles.searchInput}>
          <img
            style={{ width: 20, height: 20 }}
            src={require("../../assets/images/search.png")}
            alt=""
          ></img>
          <input
            placeholder="Search Bar"
            onKeyUp={(e) => {
              if (e.keyCode === 13) {
                // request()
              }
            }}
          ></input>
        </div>
        <div style={{ flex: 1 }}>
          <div className={styles.menus}>
            <MyMenu></MyMenu>
          </div>
        </div>

        <button className="button">Connect AAA</button>

        <img
          className={styles.headimg}
          onClick={() => {
            if (user) {
              navagate("/usercenter");
            } else {
              navagate("/signin");
            }
          }}
          src={require("../../assets/images/user.png")}
          alt=""
        ></img>

        <div
          className={styles.menuIcon}
          onClick={() => {
            setShowMenu(!showMenu);
          }}
        >
          <MenuOutlined
            color={theme === "Light" ? "#000" : "#fff"}
            style={{ fontSize: 20 }}
          />
        </div>
      </div>
      {/* {
        showMenu ? <div className={styles.mobileMenus}>
          <MyMenu clickItem={() => {
            setShowMenu(false)
          }}></MyMenu>
        </div> : ""
      } */}
    </div>
  );
}
