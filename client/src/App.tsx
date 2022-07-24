import React, { useEffect, useState } from "react";
import styles from "./App.module.scss";
import classNames from "classnames";
import SignIn from "./SignIn";
import type { MarketplaceIdentity } from "./responseTypes";
import Web3 from "web3";
import { AbiItem, toWei, toBN } from "web3-utils";
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

const LS_KEY = "sign-in-with-metamask:authToken";

const App = () => {
  const [backendReady, setBackendReady] = useState(false);
  const [schedulerReady, setSchedulerReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);

  const handleSendTransaction = async (username: string) => {
    let web3: Web3;
    try {
      web3 = new Web3(window.ethereum as any);
    } catch (err) {
      throw new Error("You need to allow MetaMask.");
    }

    // TODO: Hardcoded Goerli Testnet USDC TOKEN CONTRACT ADDRESS.
    // See https://goerli.etherscan.io/address/0x07865c6e87b9f70255377e024ace6630c1eaa37f
    const tokenContractAddress: string =
      "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

    /// TODO: ERC-20 ABI. Refactor to separate file.
    const tokenContractABI: Array<AbiItem> = [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_spender",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_from",
            type: "address",
          },
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transferFrom",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [
          {
            name: "",
            type: "uint8",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
          {
            name: "_spender",
            type: "address",
          },
        ],
        name: "allowance",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        payable: true,
        stateMutability: "payable",
        type: "fallback",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
    ];

    const tokenContract = new web3.eth.Contract(
      tokenContractABI,
      tokenContractAddress
    );

    await window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: username,
            to: tokenContractAddress,
            // TODO: Method is based on token contract ABI. Hardcoded platform address
            // Value use string to prevent big num problems
            data: await tokenContract.methods
              .transfer(
                "0x49d0739EB001FF73b394a5A2054694A650dC9cec",
                toBN(toWei("5", "mwei"))
              )
              .encodeABI(),
          },
        ],
      })
      .then((result) => {
        // TODO: result is txn hash. Send this to backend.
        console.log(result);
      })
      .catch((error) => console.error(error));
  };

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
      const extraHeaders =
        DEV_MODE && token ? generateBearerTokenHeader(token) : undefined;
      const response = await authenticatedAxiosInstance.get("/auth/who-am-i", {
        headers: extraHeaders,
      });
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
      await authenticatedAxiosInstance.post("/auth/sign-out");
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
          <button onClick={() => handleSendTransaction(username)}>
            Send 5 USD Coin to Platform address
            <code>0x49d0739EB001FF73b394a5A2054694A650dC9cec</code>
          </button>
          <button onClick={handleSignOut}>Sign out</button>
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
