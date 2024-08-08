import { transformTradingPrice } from "@/UI/utils/Numbers";
import { fetchForwardPrice, fetchPrice } from "./calcPrice.api.service";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAppStore } from "@/UI/lib/zustand/store";
import { DEFAULT_INPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
import { calculateBidAsk } from "./helpers";
import { UsePriceProps } from "@/types/calc.api";

interface ReturnProps {
  unitPrice: string;
  isLoading: boolean;
}

export const usePrice = ({ isForward, optionType, expiryDate, strike, side }: UsePriceProps): ReturnProps => {
  const { spotContract, getContractsByPayoff, quotingParams, currentSpotPrice } = useAppStore();
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const dateInitial = formatDate(expiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, "YYYY-MM-DD");

  const runFallback = () => {
    if (strike) {
      if (strike === "-" && isForward) {
        const currentForwardContract = getContractsByPayoff("Forward")["-"];
        const contract = optionType === "NEXT_AUCTION" ? spotContract : currentForwardContract;
        setUnitPrice(contract.referencePrice);
      } else if (strike !== "-" && !isForward) {
        const contracts = getContractsByPayoff(optionType);
        setUnitPrice(contracts[strike].referencePrice);
      }
    }
    setIsLoading(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isForward) {
          setIsLoading(true);
          const dateFinal = optionType === "NEXT_AUCTION" ? dayjs().format("YYYY-MM-DD") : dateInitial;
          const price = await fetchForwardPrice({ date: dateFinal });
          if (!price.data) {
            throw new Error("Lack of data");
          }
          setUnitPrice(price.data);
          setIsLoading(false);
        } else if (strike && strike !== "-") {
          setIsLoading(true);
          const price = await fetchPrice({
            optionType: optionType,
            date: dateInitial,
            strike: strike,
          });
          if (!price.data) {
            throw new Error("Lack of data");
          }
          setUnitPrice(price.data);
          setIsLoading(false);
        }
      } catch (error) {
        runFallback();
        console.error("fetchPriceForUnit__error", error);
      }
    };

    fetchData();
  }, [isForward, optionType, expiryDate, strike]);

  return {
    unitPrice: transformTradingPrice(
      !side
        ? unitPrice
        : calculateBidAsk({
            midPrice: Number(unitPrice),
            optionType: isForward ? "Forward" : optionType,
            side: side,
            forcedSpread: undefined,
            quotingParams: quotingParams,
            currentSpotPrice,
          })
    ),
    isLoading,
  };
};
