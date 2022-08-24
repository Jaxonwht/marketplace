import React, { useState } from "react";
import Web3 from "web3";
import { axiosInstance } from "../../utils/network";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface CryptoSignInProps {
  onSignedIn: (token: string) => Promise<void>;
  asDealer?: boolean;
}

const MESSAGE_PREFIX = "I am signing in with my one-time nonce: ";

const CryptoSignIn = ({ onSignedIn, asDealer }: CryptoSignInProps) => {
  const [loading, setLoading] = useState(false); // Loading button state

  const getNonce = async (walletAccount: string) =>
    (
      await axiosInstance.get(`/auth/${walletAccount}/nonce`, {
        params: {
          as_dealer: asDealer,
        },
      })
    ).data as string;

  const authenticate = async (walletAccount: string, signature: string) => {
    const response = await axiosInstance.post(
      "/auth/sign-in",
      {
        username: walletAccount,
        signature: signature,
        message_prefix: MESSAGE_PREFIX,
      },
      {
        params: {
          as_dealer: asDealer,
        },
      }
    );
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
      throw new Error("You need to sign the message to be able to sign in.");
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
      await onSignedIn(access_token);
    } catch (error) {
      window.alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="button" onClick={handleClick}>
      {loading ? "Loading..." : "Sign in with MetaMask"}
    </button>
  );
};

export default CryptoSignIn;
