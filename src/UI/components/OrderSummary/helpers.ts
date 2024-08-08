import { formatNumberByCurrency } from "@/UI/utils/Numbers";

export const calculateTotalPremium = (premium: string, fee?: number) => {
  return formatNumberByCurrency(calculateTotalPremiumPlain(premium, fee), "string", "USDC");
};

export const calculateTotalPremiumPlain = (premium: string, fee?: number) => {
  return Math.abs(Number(premium) + Number(fee));
};
