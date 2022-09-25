// components/layout.js
import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { getUser } from "../../utils/storage";
import MyMenu from "../Menu/Menu";
import { Link, useNavigate } from "react-router-dom";
import { Typography } from "antd";
import { isMobile } from "../../utils/utils";
import { MenuOutlined } from "@ant-design/icons";
import CryptoSignIn from "../../components/metamask/CryptoSignIn";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Theme } from "../../reduxSlices/themeSlice";
import { refreshSignInStatus } from "../../reduxSlices/identitySlice";
import { setIsMobile } from "../../reduxSlices/mobileSlice";
import CryptoSignOut from "../metamask/CryptoSignOut";
import GeneratedImage from "../generated_image/GeneratedImage";
import { shortenAddress } from "../../utils/address";
import SearchInput from "./SearchInput";

const Navbar = () => {
  const { Text } = Typography;
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
      <Text className={styles.welcomeMessage}>
        Welcome, {identity.account_type} {shortenAddress(identity.username)}
      </Text>
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
            <img
              alt="AISSI"
              className={styles.logo}
              src={require("../../assets/images/logo.jpg")}
            />
          </div>
        </Link>
        <SearchInput
          selectPlaceHolder="Search Deal"
          selectStyle={{ marginLeft: 10 }}
        />
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
