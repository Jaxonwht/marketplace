import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import { toWei, toBN } from "web3-utils";
import { axiosInstance } from "./network";

export const handleSendTransaction = async (
  username: string,
  tokenContractABI: AbiItem[],
  tokenContractAddress: string,
  recipientAddress: string,
  amount: string
) => {
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
    const txnHash = (await window.ethereum.request({
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
    })) as string;
    await axiosInstance.post(`/platform-transaction/${txnHash}`, {
      as_dealer: false,
    });
  } catch (error) {
    console.error(error);
    window.alert("The transaction did not complete successfully.");
  }
};
