// components/layout.js
import React, { useEffect } from "react";
import styles from "./style.module.css";
import { clear, getUser } from "../../utils/storage";
import {
  Link,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function Layout(props: any) {
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();

  console.log("params", location);
  useEffect(() => {
    if (location.pathname === "/") {
      console.log("redirext");
      navigate("/home");
    }
  }, []);

  if (user) {
  }
  return (
    <div className={styles.layout}>
      <Navbar></Navbar>

      <div className={styles.content}>
        <div className={styles.outletContent}>
          <Outlet></Outlet>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}