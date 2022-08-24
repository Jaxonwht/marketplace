import { HashRouter as Router, useRoutes } from "react-router-dom";
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

import { useSelector, useDispatch } from "react-redux";
import { isMobile } from "./utils/utils";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setIsMobile } from "./reduxSlices/mobileSlice";

require("intl/locale-data/jsonp/en.js");
require("intl/locale-data/jsonp/zh.js"); // or 'antd/dist/antd.less'
// app locale data
const locales = {
  "en-US": require("./locales/en-US.json"),
  "zh-CN": require("./locales/zh-CN.json"),
};
const GetRoutes = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <Layout></Layout>,
      children: [
        {
          path: "home",
          element: <Home></Home>,
        },
        {
          path: "nnf",
          element: <NNF></NNF>,
        },
        {
          path: "about",
          element: <About></About>,
        },
        {
          path: "nnfDetail",
          element: <NNFDetail></NNFDetail>,
        },
        {
          path: "signin",
          element: <Signin></Signin>,
        },
        {
          path: "signup",
          element: <Signup></Signup>,
        },
        {
          path: "usercenter",
          element: <Usercenter></Usercenter>,
        },
      ],
    },
  ]);

  return routes;
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
    console.log("init=====");

    dispatch(setIsMobile(isMobile()));
    loadLocales();
  }, []);

  return initDone ? (
    <Router>
      {/* <Routes>
        <Route path='/' element={Home} />
      </Routes> */}
      <GetRoutes />
    </Router>
  ) : (
    <div></div>
  );
};

export default App;
