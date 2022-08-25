import { LS_KEY } from "./network";

export const getUser = (): string | null => {
  let u = localStorage.getItem("login_user");
  if (u) {
    return JSON.parse(u);
  }
  return null;
};

export const saveUser = (user: string) => {
  localStorage.setItem("login_user", JSON.stringify(user));
};

export const clear = (_user: string) => {
  localStorage.removeItem("login_user");
};

export const storeCredentials = (access_token: string) => {
  localStorage.setItem(LS_KEY, access_token);
};
