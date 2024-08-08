import { PositionRow } from "../types";

export const filterProductsInPositions = (data: PositionRow[], filterArray: string[]) => {
  if (filterArray.length == 0) {
    return data;
  }
  const filteredData = data.filter(item => filterArray.includes(item.product.toUpperCase()));
  return filteredData;
};

export const filterExpiryInPositions = (data: PositionRow[], filterArray: string[]) => {
  if (filterArray.length == 0) {
    return data;
  }
  const filteredData = data.filter(item => filterArray.includes(item.tenor.toUpperCase()));
  return filteredData;
};

export const filterStrikeInPositions = (data: PositionRow[], filterArray: string[]) => {
  if (filterArray.length == 0) {
    return data;
  }
  const filteredData = data.filter(item => filterArray.includes(`${item.strike}`.toUpperCase()));
  return filteredData;
};
