import React, { useEffect, useState } from "react";
import styles from "./App.module.scss";
import classNames from "classnames";
import Login from "./Login";
import type { MarketplaceIdentity } from "./responseTypes";
import {
  authenticatedAxiosInstance,
  axiosInstance,
  DEV_MODE,
  generateBearerTokenHeader,
} from "./utils";

const connectionStatusClassName = (connected: boolean) =>
  classNames(styles["connection-status"], {
    [styles["connection-status--connected"]]: connected,
  });

const LS_KEY = "login-with-metamask:authToken";

const App = () => {
  const [backendReady, setBackendReady] = useState(false);
  const [schedulerReady, setSchedulerReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);

  const nullifyLoginStatus = () => {
    setAccountType(null);
    setUsername(null);
  };

  const refreshLoginStatus = async () => {
    const token = localStorage.getItem(LS_KEY);
    if (DEV_MODE && token === null) {
      nullifyLoginStatus();
      return;
    }
    try {
      const extraHeaders =
        DEV_MODE && token ? generateBearerTokenHeader(token) : undefined;
      const response = await authenticatedAxiosInstance.get("/auth/who-am-i", {
        headers: extraHeaders,
      });
      const identity = response.data as MarketplaceIdentity;
      setUsername(identity.username);
      setAccountType(identity.account_type);
    } catch (error) {
      nullifyLoginStatus();
    }
  };

  const handleLogin = async (token: string) => {
    if (DEV_MODE) {
      localStorage.setItem(LS_KEY, token);
    }
    await refreshLoginStatus();
  };

  useEffect(() => {
    axiosInstance
      .get("/hello-world")
      .then(() => setBackendReady(true))
      .catch((e) => {
        console.error(e);
        setBackendReady(false);
      });
    axiosInstance
      .get("/scheduler-status")
      .then(() => setSchedulerReady(true))
      .catch((e) => {
        console.error(e);
        setSchedulerReady(false);
      });
    refreshLoginStatus();
  });

  const handleLogout = async () => {
    if (DEV_MODE) {
      localStorage.removeItem(LS_KEY);
      await refreshLoginStatus();
      return;
    }
    try {
      await authenticatedAxiosInstance.post("/auth/sign-out");
      await refreshLoginStatus();
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (window.ethereum !== undefined) {
      window.ethereum.on("accountsChanged", handleLogout);
    } else {
      alert("Please install MetaMask to use this service!");
    }
    return () => {
      window.ethereum.removeListener("accountsChanged", handleLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {username && accountType ? (
        <div>
          username: {username}, account type: {accountType}
        </div>
      ) : (
        <React.Fragment>
          <Login onLoggedIn={handleLogin} />
          <Login onLoggedIn={handleLogin} asDealer />
        </React.Fragment>
      )}
      <button onClick={handleLogout}>Log out</button>
    </React.Fragment>
  );
};

export default App;
