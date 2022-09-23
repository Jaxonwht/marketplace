// components/layout.js
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { clear, getUser, storeCredentialsIfDev } from "../../utils/storage";
import MyMenu from "../Menu/Menu";

import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Select, Avatar, Typography } from "antd";
import intl from "react-intl-universal";
import { useDispatch } from "react-redux";
import { isMobile } from "../../utils/utils";
import { MenuOutlined, SearchOutlined } from "@ant-design/icons";
import { request } from "http";
import CryptoSignIn from "../../components/metamask/CryptoSignIn";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Theme } from "../../reduxSlices/themeSlice";
import { refreshSignInStatus } from "../../reduxSlices/identitySlice";
import { setIsMobile } from "../../reduxSlices/mobileSlice";
import CryptoSignOut from "../metamask/CryptoSignOut";
import GeneratedImage from "../generated_image/GeneratedImage";
import {
  fuzzySearchDealInfo,
  selectAllNonClosedDealInfo,
} from "../../selectors/dealInfo";
import { fetchAllDealInfo } from "../../reduxSlices/dealInfoSlice";
import { shortenAddress } from "../../utils/address";

const Navbar = () => {
  const { Text } = Typography;
  const { Option } = Select;
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

  const SearchInput: React.FC<{ placeholder: string; style: React.CSSProperties }> = props => {
  const [data, setData] = useState<any[]>([]);
  const [value, setValue] = useState<string>();

  const handleSearch = (newValue: string) => {
    if (newValue) {
      // fetch(newValue, setData);
    } else {
      setData([]);
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const options = data.map(d => <Option key={d.value}>{d.text}</Option>);

  return (
    <Select
      showSearch
      value={value}
      placeholder={props.placeholder}
      style={props.style}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={null}
    >
      {options}
    </Select>
  );
};


  const [searchStr, setSearchStr] = useState<string>("");

  const fuzzySearchResults = useAppSelector(fuzzySearchDealInfo(searchStr));
  console.log(fuzzySearchResults);

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
            <Text>AISSI</Text>
          </div>
        </Link>
          <SearchInput placeholder="Search" style={{ width: 200 }}/>
          <div style={{ flex: 1 }} >
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
