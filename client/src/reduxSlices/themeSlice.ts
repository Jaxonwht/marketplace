import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum Theme {
  LIGHT = "Light",
  DARK = "Dark",
}

const initialState = Theme.LIGHT;

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (_state, action: PayloadAction<Theme>) => {
      return action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;
