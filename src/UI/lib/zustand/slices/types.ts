import { QuotingParams } from "@/types/calc.api";
import {
  Contract,
  IthacaSDK,
  SocketOrder,
  ReferencePrice,
  SystemInfo,
  SquidTokenData,
  GetStatusResponse,
  GetRouteResponse,
  BestBidPreciseResponse,
} from "@ithaca-finance/sdk";
import { Account, Chain, Transport, WalletClient } from "viem";

export interface ContractDetails {
  [strike: string]: Contract & ReferencePrice;
}

export interface ContractList {
  [currencyPair: string]: {
    [expiry: string]: {
      [payoff: string]: ContractDetails;
    };
  };
}

export interface CrossChainTransaction {
  route: GetRouteResponse["route"];
  status: GetStatusResponse;
  timestamp: number;
}

export interface BestBidAsk {
  [key: string]: {
    bestAsk: number | null;
    bestAskType: string | null;
    bestBid: number | null;
    bestBidType: string | null;
  };
}

export interface IthacaSDKSlice {
  quotingParams: QuotingParams;
  isSigned: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLocationRestricted: boolean;
  isMaintenanceEnabled: boolean;
  ithacaSDK: IthacaSDK;
  systemInfo: SystemInfo;
  nextAuction: number;
  currentExpiryDate: number;
  currentCurrencyPair: string;
  currentSpotPrice: number;
  currencyPrecision: { underlying: number; strike: number };
  contractList: ContractList;
  unFilteredContractList: Contract[];
  expiryList: number[];
  referencePrices: ReferencePrice[];
  spotPrices: { [currencyPair: string]: number };
  toastNotifications: SocketOrder[];
  openOrdersCount: number;
  newToast?: SocketOrder;
  contractsWithReferencePrices: { [key: string]: Contract & ReferencePrice };
  spotContract: Contract & ReferencePrice;
  axelarSupportedTokens: SquidTokenData[];
  crossChainTransactions: CrossChainTransaction[];
  setIthacaSDK: () => Promise<IthacaSDK>;
  initIthacaSDK: (
    walletClient: WalletClient<Transport, Chain, Account>,
    retryCount?: number,
    maxRetries?: number
  ) => void;
  fetchContractList: () => Promise<void>;
  disconnect: () => void;
  initIthacaProtocol: (retryCount?: number, maxRetries?: number) => Promise<void>;
  checkLocationRestriction: () => Promise<void>;
  checkSystemInfo: () => Promise<void>;
  fetchNextAuction: () => Promise<void>;
  fetchSpotPrices: () => Promise<void>;
  fetchBestBidAskPrecise: () => Promise<BestBidPreciseResponse["payload"]>;
  getContractsByPayoff: (payoff: string) => ContractDetails;
  getContractsByExpiry: (expiry: string, payoff: string) => ContractDetails;
  setCurrentExpiryDate: (date: number) => void;
  fetchAxelarSupportedTokens: (chainId: number) => Promise<void>;
  addCrossChainTransaction: (transaction: CrossChainTransaction) => void;
  updateCrossChainTxnStatus: (transactions: CrossChainTransaction[]) => void;
}
