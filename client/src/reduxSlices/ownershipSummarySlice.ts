import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import { authenticatedAxiosInstance } from "../utils/network";
import type { OwnershipSummary } from "../backendTypes";

const initialState: OwnershipSummary[] = [];

const ownershipSummarySlice = createSlice({
  name: "ownershipSummary",
  initialState,
  reducers: {
    setOwnershipSummary: (
      _state,
      action: PayloadAction<OwnershipSummary[]>
    ) => {
      return action.payload;
    },
  },
});

export const { setOwnershipSummary } = ownershipSummarySlice.actions;

export default ownershipSummarySlice.reducer;

export const fetchOnwershipSummary =
  (username: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await authenticatedAxiosInstance().get(
        `/profits-summary/${username}`
      );
      const ownershipSummaries = response.data as OwnershipSummary[];
      dispatch(setOwnershipSummary(ownershipSummaries));
    } catch (e) {
      console.error(e);
      dispatch(setOwnershipSummary([]));
    }
  };
