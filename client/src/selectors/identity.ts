import { createSelector } from "@reduxjs/toolkit";
import { AccountType } from "../reduxSlices/identitySlice";
import type { RootState } from "../store/index";

export const selectIsDealer = createSelector(
  (state: RootState) => state.identity,
  (identity) => identity?.account_type === AccountType.DEALER
);

export const selectIsBuyer = createSelector(
  (state: RootState) => state.identity,
  (identity) => identity?.account_type === AccountType.BUYER
);
