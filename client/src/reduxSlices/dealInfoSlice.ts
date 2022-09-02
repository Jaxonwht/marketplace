import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DealInfo } from "../backendTypes";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utils/network";

const initialState: Record<number, DealInfo> = {};

const dealInfoSlice = createSlice({
  name: "dealInfo",
  initialState,
  reducers: {
    setDealInfo: (state, action: PayloadAction<DealInfo[]>) => {
      return action.payload.reduce((currentObject, dealInfo) => {
        currentObject[dealInfo.serial_id] = dealInfo;
        return currentObject;
      }, {} as Record<number, DealInfo>);
    },
    setDealInfoForOneDeal: (state, action: PayloadAction<DealInfo>) => {
      const dealInfo = action.payload;
      state[dealInfo.serial_id] = dealInfo;
    },
  },
});

export const { setDealInfo, setDealInfoForOneDeal } = dealInfoSlice.actions;

export default dealInfoSlice.reducer;

export const fetchAllDealInfo = async (dispatch: AppDispatch) => {
  try {
    const response = await axiosInstance.get("/deal/");
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
