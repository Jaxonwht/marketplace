import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type { AbiItem } from "web3-utils";

export const DEV_MODE = process.env.NODE_ENV === "development";

export const WEB_BACKEND_ENDPOINT = DEV_MODE ? "http://localhost:5000" : "/api";

/** This is used to protect against CSRF attacks by using a double submit token. */
const csrfConfig: AxiosRequestConfig = {
  xsrfHeaderName: "X-CSRF-TOKEN",
  xsrfCookieName: "csrf_access_token",
};

export const LS_KEY = "sign-in-with-metamask:authToken";

export const axiosInstance = axios.create({
  baseURL: WEB_BACKEND_ENDPOINT,
});

const extraHeaders = () => {
  const token = localStorage.getItem(LS_KEY);
  return token ? generateBearerTokenHeader(token) : undefined;
};

const prodAuthenticatedAxiosInstance = axios.create({
  ...csrfConfig,
  baseURL: WEB_BACKEND_ENDPOINT,
});

export const authenticatedAxiosInstance = () =>
  DEV_MODE
    ? axios.create({
        baseURL: WEB_BACKEND_ENDPOINT,
        headers: extraHeaders(),
      })
    : prodAuthenticatedAxiosInstance;

export const generateBearerTokenHeader = (bearerToken: string) => ({
  Authorization: `Bearer ${bearerToken}`,
});

// Hardcoded Goerli Testnet USDC TOKEN CONTRACT ADDRESS.
// See https://goerli.etherscan.io/address/0x07865c6e87b9f70255377e024ace6630c1eaa37f
export const GOERLI_USDC = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

// ERC-20 ABI. Refactor to separate file.
export const ERC_20_ABI: Array<AbiItem> = [
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

export const PLATFORM_ADDRESS = "0x49d0739EB001FF73b394a5A2054694A650dC9cec";
