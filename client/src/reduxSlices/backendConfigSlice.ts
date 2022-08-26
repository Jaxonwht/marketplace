import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BackendConfig } from "../backendTypes";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utils/network";

const initialState: BackendConfig | null = null as BackendConfig | null;

const backendConfigSlice = createSlice({
  name: "backendConfig",
  initialState,
  reducers: {
    setBackendConfig: (_state, action: PayloadAction<BackendConfig | null>) => {
      return action.payload;
    },
  },
});

const { setBackendConfig } = backendConfigSlice.actions;

export default backendConfigSlice.reducer;

export const fetchBackendConfig = async (dispatch: AppDispatch) => {
  try {
    const response = axiosInstance.get("/public-config");
    const backendConfig = (await response).data as BackendConfig;
    dispatch(setBackendConfig(backendConfig));
  } catch (e) {
    console.error(e);
  }
};
