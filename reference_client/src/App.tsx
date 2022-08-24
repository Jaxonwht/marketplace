import React, { useEffect, useState } from "react";
import styles from "./App.module.scss";
import classNames from "classnames";
import SignIn from "./SignIn";
import type { MarketplaceIdentity } from "./responseTypes";
import {
  authenticatedAxiosInstance,
  axiosInstance,
  DEV_MODE,
  ERC_20_ABI,
  GOERLI_USDC,
  LS_KEY,
  PLATFORM_ADDRESS,
} from "./utils";
import TokenSender from "./TokenSender";

const connectionStatusClassName = (connected: boolean) =>
  classNames(styles["connection-status"], {
    [styles["connection-status--connected"]]: connected,
  });

const App = () => {
  const [backendReady, setBackendReady] = useState(false);
  const [schedulerReady, setSchedulerReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);

  const nullifySignInStatus = () => {
    setAccountType(null);
    setUsername(null);
  };

  const refreshSignInStatus = async () => {
    const token = localStorage.getItem(LS_KEY);
    if (DEV_MODE && token === null) {
      nullifySignInStatus();
      return;
    }
    try {
      const response = await authenticatedAxiosInstance().get("/auth/who-am-i");
      const identity = response.data as MarketplaceIdentity;
      setUsername(identity.username);
      setAccountType(identity.account_type);
    } catch (error) {
      nullifySignInStatus();
    }
  };

  const handleSignIn = async (token: string) => {
    if (DEV_MODE) {
      localStorage.setItem(LS_KEY, token);
    }
    await refreshSignInStatus();
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
    refreshSignInStatus();
  });

  const handleSignOut = async () => {
    if (DEV_MODE) {
      localStorage.removeItem(LS_KEY);
      await refreshSignInStatus();
      return;
    }
    try {
      await authenticatedAxiosInstance().post("/auth/sign-out");
      await refreshSignInStatus();
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleSignOut);
    } else {
      alert("Please install MetaMask to use this service!");
    }
    return () => {
      window.ethereum.removeListener("accountsChanged", handleSignOut);
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
      </header>
      <div className={styles["sign-in-area"]}></div>
      {username && accountType ? (
        <React.Fragment>
          <div>
            username: {username}, account type: {accountType}
          </div>
          <button onClick={handleSignOut}>Sign out</button>
          <TokenSender
            tokenContractAddress={GOERLI_USDC}
            tokenContractABI={ERC_20_ABI}
            recipientAddress={PLATFORM_ADDRESS}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <SignIn onSignedIn={handleSignIn} />
          <SignIn onSignedIn={handleSignIn} asDealer />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default App;
