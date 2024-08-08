import { SettlementRow } from "../types";

export const filterExpiry = (data: SettlementRow[], filterArray: string[]) => {
  if (filterArray.length == 0) {
    return data;
  }

  const filteredData = data.filter(item => filterArray.includes(item.tenor.toUpperCase()));
  return filteredData;
};

export const filterCurrencyPair = (data: SettlementRow[], filterArray: string[]) => {
  if (filterArray.length == 0) {
    return data;
  }

  const filteredData = data.filter(item => {
    const containsElement = filterArray.some(element => item.currencyPair.includes(element));
    return containsElement;
  });
  return filteredData;
};
