import { QuotingParams } from "@/types/calc.api";
import { SideUnion } from "@/utils/types";

const MINIMUM_PRICE = 0.01;

interface BaseCalculateBidAskProps {
  midPrice: number;
  optionType: string;
  side: SideUnion;
  currentSpotPrice: number;
}

interface ForcedSpreadProps extends BaseCalculateBidAskProps {
  forcedSpread: number;
  quotingParams?: never;
}

interface QuotingParamsProps extends BaseCalculateBidAskProps {
  forcedSpread?: never;
  quotingParams: QuotingParams;
}

type CalculateBidAskProps = ForcedSpreadProps | QuotingParamsProps;
export const calculateBidAsk = ({
  midPrice,
  optionType,
  side,
  currentSpotPrice,
  forcedSpread,
  quotingParams,
}: CalculateBidAskProps): number => {
  let totalSpread;
  let MINIMUM_PRICE;

  // Determine the spread and minimum price based on the option type
  if (optionType === "BinaryPut" || optionType === "BinaryCall") {
    MINIMUM_PRICE = 0.0001;
    totalSpread = quotingParams?.DIGITAL_SPREAD;
  } else if (optionType === "Forward") {
    MINIMUM_PRICE = 0.001;
    totalSpread = quotingParams?.FORWARD_SPREAD || 0;
    const bid = midPrice - 0.4 * totalSpread;
    const ask = midPrice + 0.6 * totalSpread;
    return side === "SELL" ? Math.max(bid, MINIMUM_PRICE) : Math.max(ask, MINIMUM_PRICE);
  } else {
    MINIMUM_PRICE = 0.001;
    totalSpread = ((quotingParams?.VANILLA_SPREAD ?? 0) / 100 / 100) * currentSpotPrice;
  }

  // Overwrite total spread if forcedSpread is provided
  if (forcedSpread !== undefined) {
    totalSpread = forcedSpread;
  }

  if (totalSpread === undefined) {
    throw new Error("Unable to determine totalSpread. Provide valid quotingParams or forcedSpread.");
  }

  const halfSpread = totalSpread / 2;

  // Calculate the bid or ask price based on the side
  let price;
  if (side === "SELL") {
    price = midPrice - halfSpread;
  } else {
    price = midPrice + halfSpread;
  }

  return price > 0 ? price : MINIMUM_PRICE;
};
