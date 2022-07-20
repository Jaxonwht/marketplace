import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";
import axios from "axios";
import { WEB_BACKEND_ENDPOINT } from "./endpoints";
import classNames from "classnames";
import Login from "./Login";

const LS_KEY = "login-with-metamask:authToken";

const connectionStatusClassName = (connected: boolean) =>
  classNames("connection-status", {
    "connection-status--connected": connected,
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

  const handleLoggedIn = (token: string) => {
    localStorage.setItem(LS_KEY, JSON.stringify(token));
    setToken(token);
  };

  const handleLoggedOut = () => {
    localStorage.removeItem(LS_KEY);
    setToken(null);
  };

  return (
    <div>
      <header>
        <p>
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
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div className="App-intro">
        {token ? (
          <div>Hello</div>
        ) : (
          <Login onLoggedIn={handleLoggedIn} onLoggedOut={handleLoggedOut} />
        )}
      </div>
    </div>
  );
};

export default App;
