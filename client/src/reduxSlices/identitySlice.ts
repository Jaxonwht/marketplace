import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import { authenticatedAxiosInstance } from "../utils/network";

export enum AccountType {
  ADMIN = "admin",
  BUYER = "buyer",
  DEALER = "dealer",
}

export type Identity = {
  username: string;
  account_type: AccountType;
} | null;

const initialState: Identity = null as Identity;

const identitySlice = createSlice({
  name: "identity",
  initialState,
  reducers: {
    setIdentity: (_state, action: PayloadAction<Identity>) => {
      return action.payload;
    },
  },
});

export const { setIdentity } = identitySlice.actions;

export default identitySlice.reducer;

export const refreshSignInStatus = async (dispatch: AppDispatch) => {
  try {
    const response = await authenticatedAxiosInstance().get("/auth/who-am-i");
    dispatch(setIdentity(response.data));
  } catch (error) {
    dispatch(setIdentity(null));
  }
};
