import { DealInfo } from "../backendTypes";
import type { RootState } from "../store";

export const selectDealInfoForSerialId =
  (dealSerialId?: number) => (state: RootState) =>
    dealSerialId === undefined ? undefined : state.dealInfo[dealSerialId];

export const selectAllNonClosedDealInfo = (state: RootState) => {
  const result = {} as Record<number, DealInfo>;

  Object.entries(state.dealInfo)
    .filter(([key, singleDealInfo]) => !singleDealInfo.closed)
    .forEach(([key, singleDealInfo]) => (result[Number(key)] = singleDealInfo));

  return result;
};

export const selectAllNonClosedDealInfoList = (state: RootState) =>
  Object.values(state.dealInfo).filter(
    (singleDealInfo) => !singleDealInfo.closed
  );
