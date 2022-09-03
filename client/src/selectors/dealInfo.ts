import type { RootState } from "../store";

export const selectDealInfoForSerialId =
  (dealSerialId?: number) => (state: RootState) =>
    dealSerialId === undefined ? undefined : state.dealInfo[dealSerialId];

export const selectAllNonClosedDealInfo = (state: RootState) =>
  Object.values(state.dealInfo).filter(
    (singleDealInfo) => !singleDealInfo.closed
  );
