import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
const initialState = false;

const isMobileSlice = createSlice({
  name: "isMobile",
  initialState,
  reducers: {
    setIsMobile: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export const { setIsMobile } = isMobileSlice.actions;
export default isMobileSlice.reducer;
