import { SideUnion } from "@/utils/types";
import { TableExpandedRowData, TableRowDataWithExpanded } from "../TableOrder/types";
import { LegFormatted } from ".";

export const getStrategiesFormatted = (data?: LegFormatted[]) => {
  if (!data?.length) return [];
  return data.map(item => {
    return {
      leg: {
        contractId: 0, // fake contract id to satisfy TS
        quantity: `${item.size}` as `${number}`,
        side: item.side as SideUnion,
      },
      referencePrice: item.averageExecutionPrice || 0,
      payoff: item.type,
      strike: `${item.strike}`,
    };
  });
};

export const getOptionLegsFormatted = (data?: LegFormatted[]) => {
  if (!data?.length) return [];
  return data?.map(item => {
    return {
      contractId: 0, // fake contract id to satisfy TS
      quantity: `${item.size}` as `${number}`,
      side: item.side as SideUnion,
      premium: item.averageExecutionPrice || 0,
      payoff: item.type,
      economics: {
        strike: item.strike || 0,
      },
    };
  });
};
