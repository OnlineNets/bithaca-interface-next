import { Contract, ReferencePrice, SystemInfo } from "@ithaca-finance/sdk";
import { ContractList } from "./types";

interface OwnProps {
  currentCurrencyPair: string;
  systemInfo: SystemInfo;
  spotPrices: {
    [key: string]: number;
  };
  contractList: Contract[];
  contractsWithReferencePrices: { [key: string]: Contract & ReferencePrice };
  referencePrices: ReferencePrice[];
}

export const transformInitData = ({
  currentCurrencyPair,
  systemInfo,
  spotPrices,
  contractList,
  contractsWithReferencePrices,
  referencePrices,
}: OwnProps) => {
  const [underlyingCurrency, strikeCurrency] = currentCurrencyPair.split("/");
  const currencyPrecision = {
    underlying: systemInfo.currencyPrecision[underlyingCurrency],
    strike: systemInfo.currencyPrecision[strikeCurrency],
  };

  const currentSpotPrice = spotPrices[currentCurrencyPair];
  contractList.forEach(contract => {
    contractsWithReferencePrices[contract.contractId] = {
      ...contractsWithReferencePrices[contract.contractId],
      ...contract,
    };
  });
  referencePrices.forEach(ref => {
    contractsWithReferencePrices[ref.contractId] = { ...contractsWithReferencePrices[ref.contractId], ...ref };
  });
  let spotContract = undefined;
  const filteredContractList = Object.values(contractsWithReferencePrices).reduce<ContractList>((result, contract) => {
    const {
      economics: { currencyPair, expiry, strike },
      payoff,
    } = contract;
    if (payoff === "Spot") {
      spotContract = contract;
      return result;
    }
    if (!result[currencyPair]) result[currencyPair] = {};
    if (!result[currencyPair][expiry]) result[currencyPair][expiry] = {};
    if (!result[currencyPair][expiry][payoff]) result[currencyPair][expiry][payoff] = {};
    if (!strike || (strike - currentSpotPrice <= 750 && strike - currentSpotPrice >= -750))
      result[currencyPair][expiry][payoff][strike ?? "-"] = contract;

    return result;
  }, {});
  const expiryList = Object.keys(filteredContractList[currentCurrencyPair]).reduce((arr: number[], expiry) => {
    if (Object.keys(filteredContractList[currentCurrencyPair][expiry]).length > 4) {
      arr.push(parseInt(expiry));
    }
    return arr;
  }, []);

  return {
    spotContract,
    currencyPrecision,
    filteredContractList,
    expiryList,
    currentSpotPrice,
  };
};
