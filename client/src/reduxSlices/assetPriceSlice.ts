import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AssetPrices } from "../backendTypes";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utils/network";

const initialState: Record<number, number> = {};

const assetPriceSlice = createSlice({
  name: "assetPrice",
  initialState,
  reducers: {
    setOneAssetPrice: (
      state,
      action: PayloadAction<[number, number | null]>
    ) => {
      const [dealSerialId, price] = action.payload;
      if (price === null) {
        delete state[dealSerialId];
      } else {
        state[dealSerialId] = price;
      }
    },
    setAssetPrices: (state, action: PayloadAction<AssetPrices>) => {
      Object.entries(action.payload).forEach(([dealSerialId, price]) => {
        if (price === null) {
          delete state[Number(dealSerialId)];
        }
      });
    },
  },
});

export const { setOneAssetPrice, setAssetPrices } = assetPriceSlice.actions;

export default assetPriceSlice.reducer;

export const fetchOneAssetPrice =
  (dealSerialId: number) => async (dispatch: AppDispatch) => {
    try {
      const response = await axiosInstance.get(
        `/asset_prices/deal/${dealSerialId}`
      );
      dispatch(setOneAssetPrice([dealSerialId, response.data]));
    } catch (e) {
      dispatch(setOneAssetPrice([dealSerialId, null]));
      console.error(e);
    }
  };

export const fetchMultipleAssetPrices =
  (dealSerialIdList: number[]) => async (dispatch: AppDispatch) => {
    try {
      const response = await axiosInstance.get("/asset_prices/deal", {
        params: { serial_ids: dealSerialIdList },
      });
      dispatch(setAssetPrices(response.data));
    } catch (e) {
      console.error(e);
    }
  };
