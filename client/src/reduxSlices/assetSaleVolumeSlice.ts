import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AssetSaleVolume } from "../backendTypes";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utils/network";

interface AssetSaleVolumeState {
  readonly timestamps: string[];
  readonly saleCounts: number[];
  readonly saleMoneyValues: number[];
}

const initialState: AssetSaleVolumeState = {
  timestamps: [],
  saleCounts: [],
  saleMoneyValues: [],
};

const assetSaleVolumeSlice = createSlice({
  name: "assetSaleVolume",
  initialState,
  reducers: {
    setAssetSaleVolume: (
      state,
      action: PayloadAction<AssetSaleVolume | null>
    ) => {
      const payload = action.payload;
      if (payload === null) {
        return initialState;
      }
      const { timestamps, sale_counts, sale_money_values } = payload;
      state.timestamps = timestamps;
      state.saleCounts = sale_counts;
      state.saleMoneyValues = sale_money_values;
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
      dispatch(setAssetSaleVolume(null));
      console.error(e);
    }
  };
