import React, { ChangeEvent, useEffect, useState } from "react";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import { toWei, toBN } from "web3-utils";
import styles from "./TokenSender.module.scss";

interface TokenSenderProps {
  tokenContractAddress: string;
  tokenContractABI: AbiItem[];
  recipientAddress: string;
}

const TokenSender = ({
  tokenContractAddress,
  tokenContractABI,
  recipientAddress,
}: TokenSenderProps) => {
  const [amount, setAmount] = useState("");
  const [fromUser, setFromUser] = useState("");
  const readyToSend = !!amount && !!fromUser;
  const handleAmountInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setAmount(event.target.value);
  };

  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      return;
    }
    window.ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((accounts) => {
        if (!accounts || !Array.isArray(accounts)) {
          return;
        }
        const walletAccount: string = accounts[0];
        setFromUser(walletAccount);
      });
  });

  const handleSendTransaction = async (username: string) => {
    let web3: Web3;
    try {
      web3 = new Web3(window.ethereum as any);
    } catch (err) {
      throw new Error("You need to allow MetaMask.");
    }

    const tokenContract = new web3.eth.Contract(
      tokenContractABI,
      tokenContractAddress
    );

    try {
      const result = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: username,
            to: tokenContractAddress,
            data: await tokenContract.methods
              .transfer(recipientAddress, toBN(toWei(amount, "mwei")))
              .encodeABI(),
          },
        ],
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles["token-sender"]}>
      <input
        value={amount}
        onChange={handleAmountInputChanged}
        type="number"
        placeholder="Amount of tokens to send"
      />
      <button
        disabled={!readyToSend}
        onClick={() => handleSendTransaction(fromUser)}
      >
        Send {amount || "unknown"} USD Coin
      </button>
      {readyToSend && (
        <React.Fragment>
          <div>
            From address: <code>{fromUser}</code>
          </div>
          <div>
            To address: <code>{recipientAddress}</code>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default TokenSender;
