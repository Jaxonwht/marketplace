import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import { authenticatedAxiosInstance } from "../utils/network";
import type { BuyerInfo, DealerInfo } from "../backendTypes";

export type Balance = {
  balance: number;
  lockup_balance?: number;
} | null;

const initialState: Balance = null as Balance;

const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    setBalance: (_state, action: PayloadAction<Balance>) => {
      return action.payload;
    },
  },
});

export const { setBalance } = balanceSlice.actions;

export default balanceSlice.reducer;

export const fetchBalance =
  (username: string, asDealer: boolean) => async (dispatch: AppDispatch) => {
    try {
      if (asDealer) {
        const response = await authenticatedAxiosInstance().get(
          `/dealer/${username}`
        );
        const dealerInfo = response.data as DealerInfo;
        dispatch(
          setBalance({
            balance: dealerInfo.balance,
            lockup_balance: dealerInfo.lockup_balance,
          })
        );
      } else {
        const response = await authenticatedAxiosInstance().get(
          `/buyer/${username}`
        );
        const buyerInfo = response.data as BuyerInfo;
        dispatch(
          setBalance({
            balance: buyerInfo.balance,
          })
        );
      }
    } catch (e) {
      console.error(e);
      dispatch(setBalance(null));
    }
  };
