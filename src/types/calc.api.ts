export interface FetchPrice {
  optionType: string;
  date: string;
  strike: string | undefined;
}

export interface FetchPriceHelper extends Omit<FetchPrice, "date"> {
  isForward: boolean;
  expiryDate: number;
  side?: "BUY" | "SELL";
  forcedSpread: number;
  currentSpotPrice: number;
}

export interface UsePriceProps extends Omit<FetchPrice, "date"> {
  isForward: boolean;
  expiryDate: number;
  side?: "BUY" | "SELL";
}

export interface ApiResponse {
  data: number;
}

export type Contract = {
  contractId: number;
  payoff: string;
  expiry: string;
  strike: number | undefined;
};

export type ReceivedContract = Contract & { price: number };

export interface FetchPriceListParams {
  contracts: Contract[];
}

export type Trade = {
  currencyPair: string;
  payoff: string;
  expiry: number;
  strike?: number;
  position: number;
};

export interface FetchTradePricingParams {
  orderId: number;
  details: Trade[];
}

export type QuotingParams = {
  VANILLA_SPREAD: number;
  DIGITAL_SPREAD: number;
  FORWARD_SPREAD: number;
};
