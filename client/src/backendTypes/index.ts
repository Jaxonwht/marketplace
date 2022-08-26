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
  rate: number;
  shares: number;
  multiplier: number;
  start_time: Moment;
  end_time: Moment;
}

export interface CreateDealResponse {
  created_deal_serial_id: number;
}

export interface BackendConfig {
  max_deal_multiplier: number;
  maximum_allowed_rate: number;
  min_deal_multiplier: number;
  min_end_time_delay_from_start_time_days: number;
}
