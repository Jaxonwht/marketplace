import { DealInfo } from "../backendTypes";
import type { RootState } from "../store";
import Fuse from "fuse.js";

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

const fuseOptions = {
  includeMatches: true,
  keys: [
    "asset_id",
    "closed",
    "closed_asset_price",
    "collection_id",
    "collection_name",
    "is_nft_index",
    "dealer_name",
    "end_time",
    "extra_info",
    "lockup_balance",
    "multiplier",
    "rate",
    "serial_id",
    "share_price",
    "shares_remaining",
    "start_time",
  ],
};

export const fuzzySearchFuse = (state: RootState) =>
  new Fuse<DealInfo>(Object.values(state.dealInfo), fuseOptions);
