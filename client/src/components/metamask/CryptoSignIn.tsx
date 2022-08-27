import React, { useState } from "react";
import { Switch } from "antd";
import Web3 from "web3";
import { refreshSignInStatus } from "../../reduxSlices/identitySlice";
import { useAppDispatch } from "../../store/hooks";
import { axiosInstance } from "../../utils/network";
import styles from "./style.module.scss";
import { storeCredentialsIfDev } from "../../utils/storage";

declare global {
  interface Window {
    ethereum: any;
  }
}

const MESSAGE_PREFIX = "I am signing in with my one-time nonce: ";

const CryptoSignIn = () => {
  const [loading, setLoading] = useState(false); // Loading button state
  const [asDealer, setAsDealer] = useState(false);
  const dispatch = useAppDispatch();

  const signIn = async (accessToken: string) => {
    storeCredentialsIfDev(accessToken);
    await dispatch(refreshSignInStatus);
  };

  const getNonce = async (walletAccount: string) =>
    (
      await axiosInstance.get(`/auth/${walletAccount}/nonce`, {
        params: {
          as_dealer: asDealer,
        },
      })
    ).data as string;

  const authenticate = async (walletAccount: string, signature: string) => {
    const response = await axiosInstance.post("/auth/sign-in", {
      username: walletAccount,
      signature: signature,
      message_prefix: MESSAGE_PREFIX,
      as_dealer: asDealer,
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
      await signIn(access_token);
    } catch (error) {
      window.alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button className="button" onClick={handleClick}>
        {loading ? "Loading..." : "Sign in with MetaMask"}
      </button>
      <Switch
        checkedChildren="dealer"
        unCheckedChildren="buyer"
        checked={asDealer}
        onChange={setAsDealer}
      />
    </div>
  );
};

export default CryptoSignIn;
