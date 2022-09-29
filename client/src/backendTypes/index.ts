import { Moment } from "moment";

export interface BuyerInfo {
  name: string;
  balance: number;
}

export type DealerInfo = BuyerInfo & {
  lockup_balance: number;
};

export interface CreateDealRequestBody {
  dealer_name: string;
  collection_id: string;
  asset_id?: string;
  is_nft_index: boolean;
  rate: number;
  initial_number_of_shares: number;
  share_price: number;
  multiplier: number;
  start_time: Moment;
  end_time: Moment;
}

export interface CreateDealResponse {
  created_deal_serial_id: number;
}

export interface BuySharesRequestBody {
  buyer_name: string;
  deal_serial_id: number;
  shares: number;
}

export interface SellSharesRequestBody {
  buyer_name: string;
  deal_serial_id: number;
}

export interface BackendConfig {
  max_deal_multiplier: number;
  maximum_allowed_rate: number;
  min_deal_multiplier: number;
  min_end_time_delay_from_start_time_days: number;
}

export interface DealInfo {
  readonly asset_id: string | null;
  readonly closed: boolean;
  readonly closed_asset_price: number | null;
  readonly collection_id: string;
  readonly collection_name: string;
  readonly is_nft_index: boolean;
  readonly dealer_name: string;
  readonly end_time: string;
  readonly extra_info: Record<string, unknown>;
  readonly lockup_balance: unknown;
  readonly multiplier: number;
  readonly rate: number;
  readonly serial_id: number;
  readonly share_price: number;
  readonly shares_remaining: number;
  readonly start_time: string;
}

export interface OwnershipSummary {
  readonly deal_serial_id: number;
  readonly shares: number;
  readonly profit: number;
  readonly profit_ratio: number;
}

export interface TransactionInfo {
  readonly shares: number;
  readonly profit: number;
  readonly buy_timestamp: string;
  readonly buy_asset_price: number;
}

export type AssetPrices = Record<number, number | null>;

export type AssetPriceHistory = [string[], number[]];

export interface AssetSaleVolume {
  readonly timestamps: string[];
  readonly sale_counts: number[];
  readonly sale_money_values: number[];
}
