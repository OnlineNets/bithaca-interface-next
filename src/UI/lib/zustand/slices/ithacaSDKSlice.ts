import { StateCreator } from "zustand";
import { IthacaSDK, SocketOrder } from "@ithaca-finance/sdk";

import { checkAndDetectIp } from "@/services/kyc.api.service";
import { getFeatureFlag } from "@/utils/useFeature";
import { transformInitData } from "./helpers";
import { CrossChainTransaction, IthacaSDKSlice } from "./types";
import mixPanel from "@/services/mixpanel";
import { fetchQuotingParams } from "@/services/pricing/calcPrice.api.service";
import { fetchConfig } from "@/services/environment.service";

export const createIthacaSDKSlice: StateCreator<IthacaSDKSlice> = (set, get) => ({
  quotingParams: {
    // Initial params
    VANILLA_SPREAD: 5.25,
    DIGITAL_SPREAD: 0.05,
    FORWARD_SPREAD: 1.05,
  },
  isSigned: false,
  isLoading: true,
  isLocationRestricted: false,
  isMaintenanceEnabled: false,
  isAuthenticated: false,
  ithacaSDK: undefined!,
  systemInfo: {
    chainId: 0,
    fundlockAddress: "" as `0x${string}`,
    tokenAddress: {},
    tokenDecimals: {},
    currencyPrecision: {},
    tokenManagerAddress: "" as `0x${string}`,
    networks: [],
  },
  nextAuction: 0,
  currentExpiryDate: 0,
  currentCurrencyPair: "WETH/USDC",
  currentSpotPrice: 0,
  currencyPrecision: { underlying: 0, strike: 0 },
  contractList: {},
  unFilteredContractList: [],
  expiryList: [],
  referencePrices: [],
  spotPrices: {},
  spotContract: {
    contractId: 0,
    payoff: "Spot",
    tradeable: true,
    referencePrice: 0,
    lowRange: 0,
    highRange: 0,
    lastPrice: 0,
    updateAt: "",
    economics: {
      currencyPair: "WETH/USDC",
      expiry: 0,
      priceCurrency: "",
      qtyCurrency: "",
    },
  },
  openOrdersCount: 0,
  toastNotifications: [],
  newToast: undefined,
  axelarSupportedChains: [],
  axelarSupportedTokens: [],
  contractsWithReferencePrices: {},
  crossChainTransactions: [],
  setIthacaSDK: async () => {
    const { API_URL, WS_URL, SUBGRAPH_URL, SQUID_API_URL } = await fetchConfig();
    // Initial chain before connecting wallet
    const ithacaSDK = new IthacaSDK({
      ithacaApiBaseUrl: API_URL,
      ithacaWsUrl: WS_URL,
      ithacaSubgraphUrl: SUBGRAPH_URL,
      squidApiBaseUrl: SQUID_API_URL,
    });
    set({ ithacaSDK });
    return ithacaSDK;
  },
  initIthacaSDK: async walletClient => {
    const { API_URL, WS_URL, SUBGRAPH_URL, SQUID_API_URL } = await fetchConfig();
    const ithacaSDK = new IthacaSDK({
      ithacaApiBaseUrl: API_URL,
      ithacaWsUrl: WS_URL,
      ithacaSubgraphUrl: SUBGRAPH_URL,
      squidApiBaseUrl: SQUID_API_URL,
      walletClient,
      wsCallbacks: {
        onClose: (ev: CloseEvent) => {
          console.log(ev);
        },
        onError: (ev: Event) => {
          console.log(ev);
        },
        onMessage: (payload: SocketOrder) => {
          set({
            openOrdersCount: payload?.totalOpenOrdersCount,
            newToast: payload,
            toastNotifications: [...get().toastNotifications, payload],
          });
        },
        onOpen: (ev: Event) => {
          console.log(ev);
        },
      },
    });

    // session exists - Already logged in user
    const ithacaSession = localStorage.getItem("ithaca.session");
    if (ithacaSession) {
      try {
        const currentSession = await ithacaSDK.auth.getSession();
        if (ithacaSession === JSON.stringify(currentSession)) {
          const crossChainTransactions = localStorage.getItem("ithaca.cross-chain-transactions");
          // POINTS_EVENTS: Awoke - service connected
          mixPanel.track("Awoke");
          set({
            ithacaSDK,
            isAuthenticated: true,
            crossChainTransactions: crossChainTransactions ? JSON.parse(crossChainTransactions) : [],
          });
          return;
        }
      } catch (error) {
        console.error("Session has timed out");
      }
    }

    // New login
    try {
      const newSession = await ithacaSDK.auth.login();
      set({ isSigned: true });
      localStorage.setItem("ithaca.session", JSON.stringify(newSession));
      localStorage.setItem("ithaca.cross-chain-transactions", JSON.stringify([]));
      window.dispatchEvent(new Event("storage"));
      // POINTS_EVENTS: Login - service connected
      mixPanel.track("Login");
      set({ ithacaSDK, isAuthenticated: true });
      return;
    } catch (error) {
      console.error("Failed to log in");
    }
  },
  disconnect: async () => {
    const { ithacaSDK } = get();

    await ithacaSDK.auth.logout();
    // POINTS_EVENTS: Logout - service connected
    mixPanel.track("Logout");
    ithacaSDK.auth.logout();
    localStorage.removeItem("ithaca.session");
    localStorage.removeItem("ithaca.cross-chain-transactions");
    const { API_URL, WS_URL, SUBGRAPH_URL, SQUID_API_URL } = await fetchConfig();
    const readOnlySDK = new IthacaSDK({
      ithacaApiBaseUrl: API_URL,
      ithacaWsUrl: WS_URL,
      ithacaSubgraphUrl: SUBGRAPH_URL,
      squidApiBaseUrl: SQUID_API_URL,
    });
    set({ ithacaSDK: readOnlySDK, isAuthenticated: false });
  },
  checkLocationRestriction: async () => {
    const isLocationRestrictionFeatureEnabled = getFeatureFlag(
      "IS_LOCATION_DETECTION_ENABLED",
      process.env.NEXT_PUBLIC_IS_LOCATION_DETECTION_ENABLED,
      true
    );
    if (isLocationRestrictionFeatureEnabled === false) {
      set({
        isLocationRestricted: false,
      });
    } else {
      try {
        const { ithacaSDK, isAuthenticated } = get();
        let walletAddress = null;
        if (isAuthenticated) {
          const currentSession = await ithacaSDK.auth.getSession();
          walletAddress = currentSession.ethAddress;
        }

        const result = await checkAndDetectIp({
          walletAddress: walletAddress,
        });

        set({
          isLocationRestricted: result.status !== 200,
        });
      } catch (error) {
        console.error("KYC Checking error", error);
      }
    }
  },
  checkSystemInfo: async () => {
    try {
      await get().ithacaSDK.protocol.systemInfo();
      set({ isMaintenanceEnabled: false });
    } catch (error) {
      console.error("Maintenance enable reason:", error);
      set({ isMaintenanceEnabled: true });
    }
  },
  initIthacaProtocol: async (retryCount = 0, maxRetries = 3) => {
    const {
      currentCurrencyPair,
      setIthacaSDK,
      checkLocationRestriction,
      checkSystemInfo,
      contractsWithReferencePrices,
      initIthacaProtocol,
    } = get();
    const ithacaSDK = await setIthacaSDK();
    try {
      // Fetch initial data
      const [systemInfo, contractList, referencePrices, spotPrices, quotingParams] = await Promise.all([
        ithacaSDK.protocol.systemInfo(),
        ithacaSDK.protocol.contractList(),
        ithacaSDK.market.referencePrices(0, currentCurrencyPair),
        ithacaSDK.market.spotPrices(),
        fetchQuotingParams({ currency: "WETH" }),
      ]);

      // Transform data
      const { spotContract, currencyPrecision, filteredContractList, expiryList, currentSpotPrice } = transformInitData(
        {
          currentCurrencyPair,
          systemInfo,
          spotPrices,
          contractList,
          contractsWithReferencePrices,
          referencePrices,
        }
      );

      // Location restriction check
      await checkLocationRestriction();
      setInterval(() => {
        checkLocationRestriction();
        checkSystemInfo();
      }, 60_000);

      set({
        quotingParams: quotingParams.data ?? get().quotingParams,
        isMaintenanceEnabled: false,
        spotContract: spotContract || get().spotContract,
        isLoading: false,
        systemInfo,
        currencyPrecision,
        contractList: filteredContractList,
        unFilteredContractList: contractList,
        expiryList,
        currentExpiryDate: expiryList[0],
        referencePrices,
        spotPrices,
        currentSpotPrice,
      });
    } catch (error) {
      // Every error in
      // protocol.systemInfo
      // protocol.contractList
      // market.referencePrices
      // market.spotPrices
      // will trigger maintenance mode
      set({
        isMaintenanceEnabled: true,
      });
      console.error("Maintenance enable reason:", error);
      // In case of error retry after X seconds
      if (retryCount < maxRetries) {
        setTimeout(() => initIthacaProtocol(retryCount + 1, maxRetries), 20_000);
      }
    }
  },
  fetchContractList: async () => {
    try {
      const { currentCurrencyPair, ithacaSDK, contractsWithReferencePrices } = get();
      // Fetch initial data
      const [systemInfo, contractList, referencePrices, spotPrices] = await Promise.all([
        ithacaSDK.protocol.systemInfo(),
        ithacaSDK.protocol.contractList(),
        ithacaSDK.market.referencePrices(0, currentCurrencyPair),
        ithacaSDK.market.spotPrices(),
      ]);

      // Transform data
      const { spotContract, currencyPrecision, filteredContractList, expiryList, currentSpotPrice } = transformInitData(
        {
          currentCurrencyPair,
          systemInfo,
          spotPrices,
          contractList,
          contractsWithReferencePrices,
          referencePrices,
        }
      );
      set({
        spotContract: spotContract || get().spotContract,
        systemInfo,
        currencyPrecision,
        contractList: filteredContractList,
        unFilteredContractList: contractList,
        expiryList,
        currentExpiryDate: expiryList[0],
        referencePrices,
        spotPrices,
        currentSpotPrice,
      });
    } catch (error) {
      // Every error in
      // protocol.systemInfo
      // protocol.contractList
      // market.referencePrices
      // market.spotPrices
      // will trigger maintenance mode
      set({
        isMaintenanceEnabled: true,
      });
      console.error("Maintenance enable reason:", error);
      // In case of error retry after X seconds
    }
  },
  fetchNextAuction: async () => {
    const nextAuction = await get().ithacaSDK.protocol.nextAuction();
    set({
      nextAuction: nextAuction,
    });
  },
  fetchSpotPrices: async () => {
    const spotPrices = await get().ithacaSDK.market.spotPrices();
    const currentCurrencyPair = get().currentCurrencyPair;
    set({ spotPrices, currentSpotPrice: spotPrices[currentCurrencyPair] });
  },
  fetchBestBidAskPrecise: async () => {
    const { payload } = await get().ithacaSDK.analytics.bestBidAskPrecise();
    return payload;
  },
  getContractsByPayoff: (payoff: string) => {
    const { contractList, currentCurrencyPair, currentExpiryDate } = get();
    return contractList[currentCurrencyPair][currentExpiryDate][payoff];
  },
  getContractsByExpiry: (expiry: string, payoff: string) => {
    const { contractList, currentCurrencyPair } = get();
    return contractList[currentCurrencyPair][expiry][payoff];
  },
  setCurrentExpiryDate: (date: number) => {
    set({ currentExpiryDate: date });
  },
  fetchAxelarSupportedTokens: async (chainId: number) => {
    const { ithacaSDK } = get();
    const axelarSupportedTokens = await ithacaSDK.fundlock.getTokens(chainId);
    set({ axelarSupportedTokens });
  },
  addCrossChainTransaction: (transaction: CrossChainTransaction) => {
    const crossChainTransactions = structuredClone(get().crossChainTransactions);
    crossChainTransactions.push(transaction);
    localStorage.setItem("ithaca.cross-chain-transactions", JSON.stringify(crossChainTransactions));
    window.dispatchEvent(new Event("storage"));
    set({ crossChainTransactions });
  },
  updateCrossChainTxnStatus: (transactions: CrossChainTransaction[]) => {
    localStorage.setItem("ithaca.cross-chain-transactions", JSON.stringify(transactions));
    window.dispatchEvent(new Event("storage"));
    set({ crossChainTransactions: transactions });
  },
});
