import React, { useState } from "react";
import Web3 from "web3";
import type { MetaMaskInpageProvider } from "@metamask/providers";
import axios from "axios";
import { WEB_BACKEND_ENDPOINT } from "./endpoints";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

interface LoginProps {
  onLoggedIn: (token: string) => void;
  onLoggedOut: () => void;
}

const MESSAGE_PREFIX = "I am signing my one-time nonce: ";

const Login = ({ onLoggedIn, onLoggedOut }: LoginProps) => {
  const [loading, setLoading] = useState(false); // Loading button state

  const getNonce = async (walletAccount: string) =>
    (await axios.get(`${WEB_BACKEND_ENDPOINT}/auth/${walletAccount}/nonce`))
      .data as string;

  const authenticate = async (walletAccount: string, signature: string) => {
    const response = await axios.post(`${WEB_BACKEND_ENDPOINT}/auth/sign-in`, {
      username: walletAccount,
      signature: signature,
      message_prefix: MESSAGE_PREFIX,
    });
    return response.data.access_token;
  };

  const signMessage = async (walletAccount: string, nonce: string) => {
    let web3: Web3;
    try {
      web3 = new Web3(window.ethereum as any);
    } catch (err) {
      throw new Error("You need to allow MetaMask.");
    }
    try {
      const signature = await web3.eth.personal.sign(
        `${MESSAGE_PREFIX}${nonce}`,
        walletAccount,
        "" // MetaMask will ignore the password argument here
      );
      return signature;
    } catch (err) {
      throw new Error("You need to sign the message to be able to log in.");
    }
  };

  const handleClick = async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      window.alert("Please install MetaMask first.");
      return;
    }

    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {},
        },
      ],
    });
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || !Array.isArray(accounts)) {
      window.alert("Accounts not found.");
      return;
    }
    const walletAccount = accounts[0];

    setLoading(true);
    try {
      const nonce = await getNonce(walletAccount);
      const signature = await signMessage(walletAccount, nonce);
      const access_token = await authenticate(walletAccount, signature);
      onLoggedIn(access_token);
    } catch (error) {
      window.alert(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <p>
        Please select your login method.
        <br />
        For the purpose of this demo, only MetaMask login is implemented.
      </p>
      <button onClick={handleClick}>
        {loading ? "Loading..." : "Login with MetaMask"}
      </button>
    </div>
  );
};

export default Login;
