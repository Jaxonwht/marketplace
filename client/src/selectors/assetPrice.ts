import type { RootState } from "../store";
export const selectAssetPriceForDeal =
  (dealSerialId?: number) =>
  (state: RootState): number | undefined =>
    dealSerialId ? state.assetPrice[dealSerialId] : undefined;
