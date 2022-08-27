import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DealInfo } from "../backendTypes";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utils/network";

const initialState: DealInfo[] = [];

const dealInfoSlice = createSlice({
  name: "dealInfo",
  initialState,
  reducers: {
    setDealInfo: (state, action: PayloadAction<DealInfo[]>) => action.payload,
    setDealInfoForOneDeal: (state, action: PayloadAction<DealInfo>) => {
      const oldIndex = state.findIndex(
        (dealInfo) => dealInfo.serial_id === action.payload.serial_id
      );
      if (oldIndex === -1) {
        state.push(action.payload);
      } else {
        state.splice(oldIndex, 1, action.payload);
      }
    },
  },
});

export const { setDealInfo, setDealInfoForOneDeal } = dealInfoSlice.actions;

export default dealInfoSlice.reducer;

export const fetchOpenDealInfo = async (dispatch: AppDispatch) => {
  try {
    const response = await axiosInstance.get("/deal/open");
    dispatch(setDealInfo(response.data));
  } catch (e) {
    console.error(e);
  }
};

export const fetchDealInfoForOneDeal =
  (dealSerialId: number) => async (dispatch: AppDispatch) => {
    try {
      const response = await axiosInstance.get(`/deal/${dealSerialId}`);
      dispatch(setDealInfoForOneDeal(response.data));
    } catch (e) {
      console.error(e);
    }
  };
