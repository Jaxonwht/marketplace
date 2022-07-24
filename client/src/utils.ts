import type { AxiosRequestConfig } from "axios";
import axios from "axios";

export const DEV_MODE = process.env.NODE_ENV === "development";

export const WEB_BACKEND_ENDPOINT = DEV_MODE ? "http://localhost:5000" : "/api";

/** This is used to protect against CSRF attacks by using a double submit token. */
const csrfConfig: AxiosRequestConfig = {
  xsrfHeaderName: "X-CSRF-TOKEN",
  xsrfCookieName: "csrf_access_token",
};

export const axiosInstance = axios.create({
  baseURL: WEB_BACKEND_ENDPOINT,
});

export const authenticatedAxiosInstance = DEV_MODE
  ? axiosInstance
  : axios.create({
      ...csrfConfig,
      baseURL: WEB_BACKEND_ENDPOINT,
    });

export const generateBearerTokenHeader = (bearerToken: string) => ({
  Authorization: `Bearer ${bearerToken}`,
});
