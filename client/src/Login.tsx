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
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const getNonce = async (publicAddress: string) =>
    (await axios.get(`${WEB_BACKEND_ENDPOINT}/buyer/${publicAddress}/nonce`))
      .data as string;

  const authenticate = async (publicAddress: string, signature: string) => {
    const response = await axios.post(
      `${WEB_BACKEND_ENDPOINT}/auth/sign-in-as-buyer`,
      {
        buyer_name: publicAddress,
        signature: signature,
        message_prefix: MESSAGE_PREFIX,
      }
    );
    return response.data.access_token;
  };

  const signMessage = async (publicAddress: string, nonce: string) => {
    if (web3 === null) {
      throw new Error("You need to allow MetaMask.");
    }
    try {
      const signature = await web3.eth.personal.sign(
        `${MESSAGE_PREFIX}${nonce}`,
        publicAddress,
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

    if (!web3) {
      try {
        // Request account access if needed
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // We don't know window.web3 version, so we use our own instance of Web3
        // with the injected provider given by MetaMask
        setWeb3(new Web3(window.ethereum as any));
      } catch (error) {
        window.alert("You need to allow MetaMask.");
        return;
      }
    }

    const coinbase = await web3?.eth?.getCoinbase();
    if (!coinbase) {
      window.alert("Please activate MetaMask first.");
      return;
    }

    const publicAddress = coinbase.toLowerCase();
    setLoading(true);
    try {
      const nonce = await getNonce(publicAddress);
      const signature = await signMessage(publicAddress, nonce);
      const access_token = await authenticate(publicAddress, signature);
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
