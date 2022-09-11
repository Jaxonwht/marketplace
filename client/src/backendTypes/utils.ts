import type { DealInfo } from "./index";

export const getDealReadableName = (singleDealInfo: DealInfo) => {
  const collectionRepresentation = singleDealInfo.collection_name;
  if (!!singleDealInfo.asset_id) {
    return `${collectionRepresentation}: #${singleDealInfo.asset_id}`;
  }
  return collectionRepresentation;
};
