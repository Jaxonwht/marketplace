import { message } from "antd";
import * as storage from "./storage";

export function request(path, params, method) {
  let login_user = localStorage.getItem("login_user");
  if (login_user) {
    login_user = JSON.parse(login_user);
  }
  const config = {
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    headers: {
      "content-type": "application/json",
      Authorization: login_user
        ? "Bearer " + login_user["exchange_access_token"]
        : "",
    },
    method: method || "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // *client, no-referrer
  };
  if (!method || method === "post" || method === "put") {
    config.body = JSON.stringify(params);
  } else {
    if (params) {
      let paramsArray = [];
      //拼接参数

      Object.keys(params).forEach((key) =>
        paramsArray.push(key + "=" + params[key])
      );
      if (path.search(/\?/) === -1) {
        path += "?" + paramsArray.join("&");
      } else {
        path += "&" + paramsArray.join("&");
      }
    }
  }
  let env = process.env.NODE_ENV;
  let prefix = "";
  if (env !== "development") {
    // prefix = "https://sandbox.shiftmarkets.com";
  }
  // https://api-docs.vmeta3.com
  return fetch(prefix + path, config)
    .then((response) => response.json())
    .then((res) => {
      const json = res;
      console.log("json===", json);
      if (res.statusCode && res.statusCode === 401) {
        window.location.href = ".#/signin";
        return Promise.reject("");
      }
      if (res.code === "EDS_ACCESS_TOKEN_EXPIRED" || res.statusCode === 401) {
        // 用户token过期
        storage.clear();
        // message.error("user not login");
        //  return Promise.reject(json.msg)
        //window.location.reload();
      }
      // if (!json.result) {
      //   message.error(json.message);
      //   // return Promise.reject(json.msg)
      // } else {
      return Promise.resolve(json);
      // }
    })
    .catch((error) => {
      console.log("json===222222", error);
      message.error("error");
      return Promise.reject(error);
    });
}

export function request2(path, params, method) {
  const config = {
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    headers: {
      "content-type": "application/json",
      Authorization:
        "Bearer OEWy2lxOSpGjMw-12D4Rw2M7P2KID4hcc6rEoLpVUPQu91uYpf9n194fzmKh8mWIyIgyINuFzDX0NfYGO60bwvPEcXGob_TfkLLQMcqO5PFR6fC0r9vyaoylm2dTYnYx",
    },
    method: method || "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // *client, no-referrer
  };
  if (!method || method === "post" || method === "put") {
    config.body = JSON.stringify(params);
  }
  return fetch(
    "https://cors-anywhere.herokuapp.com/https://wallet_api.zktube.io" + path,
    config
  )
    .then((response) => response.json())
    .then((res) => {
      const json = res;
      console.log("json===", json);
      // if (json.status_code !== 200 && json.status_code !== 104 && json.status_code != 0) {
      //   message.error(json.msg);
      //   return Promise.reject(json.msg)
      // } else {
      return Promise.resolve(json);
      // }
    })
    .catch((error) => {
      console.log("json===222222", error);
      message.error("error");
      return Promise.reject(error);
    });
}
