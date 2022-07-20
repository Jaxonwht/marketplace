import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";
import axios from "axios";
import { WEB_BACKEND_ENDPOINT } from "./endpoints";
import classNames from "classnames";

const connectionStatusClassName = (connected: boolean) =>
  classNames("connection-status", {
    "connection-status--connected": connected,
  });

const App = () => {
  const [backendReady, setBackendReady] = useState(false);
  const [schedulerReady, setSchedulerReady] = useState(false);
  useEffect(() => {
    axios
      .get(`${WEB_BACKEND_ENDPOINT}/hello-world`)
      .then(() => setBackendReady(true));
    axios
      .get(`${WEB_BACKEND_ENDPOINT}/scheduler-status`)
      .then(() => setSchedulerReady(true));
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
    </div>
  );
};

export default App;
