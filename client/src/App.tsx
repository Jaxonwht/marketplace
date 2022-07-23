import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./App.module.scss";
import { WEB_BACKEND_ENDPOINT } from "./endpoints";
import classNames from "classnames";
import Login from "./Login";

const LS_KEY = "login-with-metamask:authToken";

const connectionStatusClassName = (connected: boolean) =>
  classNames(styles["connection-status"], {
    [styles["connection-status--connected"]]: connected,
  });

const App = () => {
  const [backendReady, setBackendReady] = useState(false);
  const [schedulerReady, setSchedulerReady] = useState(false);
  const [token, setToken] = useState<null | string>(null);
  useEffect(() => {
    axios
      .get(`${WEB_BACKEND_ENDPOINT}/hello-world`)
      .then(() => setBackendReady(true));
    axios
      .get(`${WEB_BACKEND_ENDPOINT}/scheduler-status`)
      .then(() => setSchedulerReady(true));
  });

  useEffect(() => {
    // Access token is stored in localstorage
    const ls = localStorage.getItem(LS_KEY);
    const token = ls && JSON.parse(ls);
    setToken(token);
  }, []);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleLoggedOut);
    } else {
      alert("Please install MetaMask to use this service!");
    }
    return () => {
      window.ethereum.removeListener("accountsChanged", handleLoggedOut);
    };
  }, [window.ethereum]);

  const handleLoggedIn = (token: string) => {
    localStorage.setItem(LS_KEY, JSON.stringify(token));
    setToken(token);
  };

  const handleLoggedOut = () => {
    localStorage.removeItem(LS_KEY);
    setToken(null);
  };

  return (
    <React.Fragment>
      <header>
        <div>
          Web Backend Status:{" "}
          <span className={connectionStatusClassName(backendReady)}>
            {backendReady ? "connected" : "disconnected"}
          </span>
        </div>
        <div>
          Scheduler Status:{" "}
          <span className={connectionStatusClassName(schedulerReady)}>
            {schedulerReady ? "connected" : "disconnected"}
          </span>
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div className={styles["login-area"]}></div>
      {token ? (
        <div>Hello</div>
      ) : (
        <Login onLoggedIn={handleLoggedIn} onLoggedOut={handleLoggedOut} />
      )}
    </React.Fragment>
  );
};

export default App;
