import React, { useState } from "react";
import Web3 from "web3";
import type { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

interface LoginProps {
  onLoggedIn: (token: string) => void;
  onLoggedOut: () => void;
}

const Login = ({ onLoggedIn, onLoggedOut }: LoginProps) => {
  const [loading, setLoading] = useState(false); // Loading button state
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const handleAuthenticate = ({
    publicAddress,
    signature,
  }: {
    publicAddress: string;
    signature: string;
  }) =>
    Promise
      .resolve // TODO: use axios to POST publicAddress, signature to backend.
      // Backend verify signature and return jwt token.
      ()
      .then((response) => JSON.parse('{"token":"test_token"}'));

  const handleSignMessage = async ({
    publicAddress,
    nonce,
  }: {
    publicAddress: string;
    nonce: string;
  }) => {
    if (web3 === null) {
      throw new Error("You need to allow MetaMask.");
    }
    try {
      const signature = await web3.eth.personal.sign(
        `I am signing my one-time nonce: ${nonce}`,
        publicAddress,
        "" // MetaMask will ignore the password argument here
      );

      return { publicAddress, signature };
    } catch (err) {
      throw new Error("You need to sign the message to be able to log in.");
    }
  };

  const handleSignup = (publicAddress: string) =>
    Promise
      .resolve // TODO: use axios to POST publicAddress to backend.
      // Backend add to user database and return address and nonce.
      ()
      .then((response) =>
        JSON.parse('{"publicAddress":"' + publicAddress + '", "nonce":42}')
      );

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

    // TODO: Look if user with current publicAddress is already present on backend
    // Use axios GET on publicAddress. The backend return a single
    // {publicAddress, nonce} object.
    Promise.resolve()
      .then((response) =>
        JSON.parse('{"publicAddress":"' + publicAddress + '", "nonce":42}')
      )
      // If yes, retrieve it. If no, create it.
      .then((users) => (users ? users : handleSignup(publicAddress)))
      // Popup MetaMask confirmation modal to sign message
      .then(handleSignMessage)
      // Send signature to backend on the /auth route
      .then(handleAuthenticate)
      // Pass accessToken back to parent component (to save it in localStorage)
      .then(onLoggedIn)
      .catch((err) => {
        window.alert(err);
        setLoading(false);
      });
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
