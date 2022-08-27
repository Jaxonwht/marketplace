import { RootState } from "../store";

export const selectDealInfoForSerialId =
  (dealSerialId?: number) => (state: RootState) =>
    dealSerialId === undefined
      ? undefined
      : state.dealInfo.find((dealinfo) => dealinfo.serial_id === dealSerialId);
