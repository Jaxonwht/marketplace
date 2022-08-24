enum AccountType {
  ADMIN = "admin",
  BUYER = "buyer",
  DEALER = "dealer",
}

export interface MarketplaceIdentity {
  username: string;
  account_type: AccountType;
}
