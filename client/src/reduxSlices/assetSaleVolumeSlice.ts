import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AssetSaleVolume } from "../backendTypes";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utils/network";

type AssetSaleVolumeState = [string[], number[]];

const initialState: AssetSaleVolumeState = [[], []];

const assetSaleVolumeSlice = createSlice({
  name: "assetSaleVolume",
  initialState,
  reducers: {
    setAssetSaleVolume: (_state, action: PayloadAction<AssetSaleVolume>) => {
      // TODO ZIYI unify api
      const payload = action.payload;
      if (payload === null || !Array.isArray(payload[0])) {
        return initialState;
      }
      return payload;
    },
  },
});

export const { setAssetSaleVolume } = assetSaleVolumeSlice.actions;

export default assetSaleVolumeSlice.reducer;

export const fetchAssetSaleVolume =
  (dealSerialId: number) => async (dispatch: AppDispatch) => {
    try {
      const response = await axiosInstance.get(
        `/asset_prices/deal/${dealSerialId}/sales`
      );
      dispatch(setAssetSaleVolume(response.data));
    } catch (e) {
      dispatch(setAssetSaleVolume(initialState));
      console.error(e);
    }
  };
