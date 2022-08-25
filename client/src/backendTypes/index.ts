export interface BuyerInfo {
  name: string;
  balance: number;
}

export type DealerInfo = BuyerInfo & {
  lockup_balance: number;
};
