import { ContractDetails } from "@/UI/lib/zustand/slices/types";

export const getStrikes = (callContracts: ContractDetails, barrier: string, upOrDown: "UP" | "DOWN") => {
  if (callContracts) {
    return Object.keys(callContracts).filter(item => {
      if (upOrDown === "DOWN") {
        return parseFloat(item) >= parseFloat(barrier);
      }
      return parseFloat(item) <= parseFloat(barrier);
    });
  }
  return [];
};

export const getBarrierStrikes = (callContracts: ContractDetails, strike: string, upOrDown: "UP" | "DOWN") => {
  if (callContracts) {
    return Object.keys(callContracts).filter(item => {
      if (upOrDown === "DOWN") {
        return parseFloat(item) < parseFloat(strike);
      }
      return parseFloat(item) > parseFloat(strike);
    });
  }
  return [];
};
