import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AssetPriceHistory } from "../backendTypes";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utils/network";

type AsssetPriceHistoryState = [string[], number[]];

const initialState: AsssetPriceHistoryState = [[], []];

const assetPriceHistorySlice = createSlice({
  name: "assetPriceHistory",
  initialState,
  reducers: {
    setAssetPriceHistory: (
      _state,
      action: PayloadAction<AssetPriceHistory>
    ) => {
      // TODO ZIYI unify api
      const payload = action.payload;
      if (payload === null || !Array.isArray(payload[0])) {
        return initialState;
      }
      return payload;
    },
  },
});

export const { setAssetPriceHistory } = assetPriceHistorySlice.actions;

export default assetPriceHistorySlice.reducer;

export const fetchAssetPriceHistory =
  (dealSerialId: number) => async (dispatch: AppDispatch) => {
    try {
      const response = await axiosInstance.get(
        `/asset_prices/deal/${dealSerialId}/history`
      );
      dispatch(setAssetPriceHistory(response.data));
    } catch (e) {
      dispatch(setAssetPriceHistory(initialState));
      console.error(e);
    }
  };
