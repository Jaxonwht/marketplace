// components/layout.js
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { clear, getUser, storeCredentialsIfDev } from "../../utils/storage";
import MyMenu from "../Menu/Menu";

import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Input, Avatar, Typography } from "antd";
import intl from "react-intl-universal";
import { useDispatch } from "react-redux";
import { isMobile } from "../../utils/utils";
import { MenuOutlined } from "@ant-design/icons";
import { request } from "http";
import CryptoSignIn from "../../components/metamask/CryptoSignIn";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Theme } from "../../reduxSlices/themeSlice";
import { refreshSignInStatus } from "../../reduxSlices/identitySlice";
import { setIsMobile } from "../../reduxSlices/mobileSlice";
import CryptoSignOut from "../metamask/CryptoSignOut";
import GeneratedImage from "../generated_image/GeneratedImage";
import { shortenAddress } from "../../utils/address";

const Navbar = () => {
  const { Text } = Typography;
  const { Search } = Input;
  const [navBg, setNavBg] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme);
  const identity = useAppSelector((state) => state.identity);

  const user = getUser();
  console.log("getUser", user);

  useEffect(() => {
    window.onscroll = function () {
      let scrollPos = window.scrollY;
      if (scrollPos > 50) {
        setNavBg(true);
      } else {
        setNavBg(false);
      }
    };
    window.onresize = () => {
      dispatch(setIsMobile(isMobile()));
    };
  }, []);

  useEffect(() => {
    dispatch(refreshSignInStatus);
  }, [dispatch]);

  const navigate = useNavigate();

  const signInDisplay = identity ? (
    <div className={styles["sign-out-container"]}>
      <div className={styles.welcomeMessage}>
        <Text>
          Welcome, {identity.account_type} {shortenAddress(identity.username)}
        </Text>
      </div>
      <CryptoSignOut />
    </div>
  ) : (
    <CryptoSignIn />
  );

  return (
    <div className={`${styles.header} ${navBg ? styles.navBg : ""}`}>
      <div className={styles.headerContent}>
        <Link to={"/home"}>
          <div className={styles.caption} style={{ cursor: "pointer" }}>
            <Avatar
              alt=""
              className={styles.logo}
              src={require("../../assets/images/logo.jpg")}
            ></Avatar>
            <Text>ASISSI</Text>
          </div>
        </Link>
        <Search placeholder="Search" onSearch={() => {}} enterButton />
        <div style={{ flex: 1 }}>
          <div className={styles.menus}>
            <MyMenu></MyMenu>
          </div>
        </div>

        {signInDisplay}

        {identity && (
          <GeneratedImage
            className={styles.headimg}
            onClick={() => {
              navigate("/usercenter");
            }}
            generateSource={identity.username}
            generateSize={60}
            alt={identity.username}
          />
        )}

        <div
          className={styles.menuIcon}
          onClick={() => {
            setShowMenu(!showMenu);
          }}
        >
          <MenuOutlined
            color={theme === Theme.LIGHT ? "#000" : "#fff"}
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
};

export default Navbar;
