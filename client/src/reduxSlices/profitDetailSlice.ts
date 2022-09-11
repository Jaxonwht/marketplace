import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import { authenticatedAxiosInstance } from "../utils/network";
import type { TransactionInfo } from "../backendTypes";

const initialState: TransactionInfo[] = [];

const profitDetailSlice = createSlice({
  name: "profitDetail",
  initialState,
  reducers: {
    setProfitDetail: (_state, action: PayloadAction<TransactionInfo[]>) => {
      return action.payload;
    },
  },
});

export const { setProfitDetail } = profitDetailSlice.actions;

export default profitDetailSlice.reducer;

export const fetchProfitDetail =
  (username: string, dealSerialId: number) => async (dispatch: AppDispatch) => {
    try {
      const response = await authenticatedAxiosInstance().get(
        "/ownership/profits-in-deal",
        {
          params: {
            buyer_name: username,
            deal_serial_id: dealSerialId,
          },
        }
      );
      const transactionInfoList = response.data as TransactionInfo[];
      dispatch(setProfitDetail(transactionInfoList));
    } catch (e) {
      console.error(e);
      dispatch(setProfitDetail([]));
    }
  };
