import { TableFundLockDataProps } from "../constants/tableFundLock";

// FoundLock table sort and filter
export const foundLockOrderDateSort = (data: TableFundLockDataProps[], dir: boolean) => {
  if (dir) {
    data.sort(
      (a: TableFundLockDataProps, b: TableFundLockDataProps) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
    );
  } else {
    data.sort(
      (a: TableFundLockDataProps, b: TableFundLockDataProps) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }
  return data;
};

export const foundLockAmountDataSort = (data: TableFundLockDataProps[], dir: boolean) => {
  if (dir) {
    data.sort((a: TableFundLockDataProps, b: TableFundLockDataProps) => Number(a.amount) - Number(b.amount));
  } else {
    data.sort((a: TableFundLockDataProps, b: TableFundLockDataProps) => Number(b.amount) - Number(a.amount));
  }
  return data;
};

export const currencyFilter = (data: TableFundLockDataProps[], filterArray: string[]) => {
  if (filterArray.length == 0) {
    return data;
  }
  const filteredData = data.filter((item: TableFundLockDataProps) => filterArray.includes(item.currency));
  return filteredData;
};

export const auctionFilter = (data: TableFundLockDataProps[], filterArray: string[]) => {
  if (filterArray.length == 0) {
    return data;
  }
  const filteredData = data.filter((item: TableFundLockDataProps) => filterArray.includes(item.auction));
  return filteredData;
};
