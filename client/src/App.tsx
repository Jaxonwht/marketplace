import { HashRouter, Route, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import NNF from "./pages/NNF/NNF";
import NNFDetail from "./pages/NNFDetail/NNFDetail";
import About from "./pages/About/About";
import Signin from "./pages/Signin/Signin";
import Signup from "./pages/Signup/Signup";

import Layout from "./components/Layout/Layout";

import intl from "react-intl-universal";
import "antd/dist/antd.css";
import Usercenter from "./pages/Usercenter/UserCenter";

import themes from "./config/theme";

import { isMobile } from "./utils/utils";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setIsMobile } from "./reduxSlices/mobileSlice";
import { fetchBackendConfig } from "./reduxSlices/backendConfigSlice";
import { fetchAllDealInfo } from "./reduxSlices/dealInfoSlice";

require("intl/locale-data/jsonp/en.js");
require("intl/locale-data/jsonp/zh.js"); // or 'antd/dist/antd.less'
// app locale data
const locales = {
  "en-US": require("./locales/en-US.json"),
  "zh-CN": require("./locales/zh-CN.json"),
};
const App = () => {
  const [initDone, setInitDone] = useState(false);
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme);

  const loadLocales = () => {
    // init method will load CLDR locale data according to currentLocale
    // react-intl-universal is singleton, so you should init it only once in your app
    intl
      .init({
        currentLocale: localStorage.getItem("language") || "en-US", // TODO: determine locale here
        locales,
      })
      .then(() => {
        // After loading CLDR locale data, start to render
        setInitDone(true);
      });
  };
  useEffect(() => {
    const themeContents = themes[theme];
    Object.entries(themeContents).forEach(([key, value]: [string, string]) =>
      document.documentElement.style.setProperty(key, value)
    );

    dispatch(setIsMobile(isMobile()));
    dispatch(fetchAllDealInfo);
    dispatch(fetchBackendConfig);
    loadLocales();
  }, [dispatch, theme]);

  return initDone ? (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/nnf" element={<NNF />} />
          <Route path="/about" element={<About />} />
          <Route path="/nnfdetail">
            <Route path=":dealSerialId" element={<NNFDetail />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/singup" element={<Signup />} />
          <Route path="/usercenter" element={<Usercenter />} />
        </Route>
      </Routes>
    </HashRouter>
  ) : (
    <div />
  );
};

export default App;
