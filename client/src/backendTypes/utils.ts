import type { DealInfo } from "./index";

export const getDealReadableName = (singleDealInfo: DealInfo) => {
  const collectionRepresentation = singleDealInfo.collection_name
    ? singleDealInfo.collection_name
    : `${singleDealInfo.collection_id.substring(0, 8)}****`;
  if (!!singleDealInfo.asset_id) {
    return `${collectionRepresentation}: #${singleDealInfo.asset_id}`;
  }
  return collectionRepresentation;
};
