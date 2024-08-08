import dayjs from "dayjs";
import { useAppStore } from "@/UI/lib/zustand/store";
import { getNumber, isInvalidNumber } from "@/UI/utils/Numbers";
import { DEFAULT_INPUT_DATE_FORMAT, readDate } from "@/UI/utils/DateFormatting";
import { usePrice } from "./usePrice";
import { useEffect, useState } from "react";

interface useCalcIvProps {
  unitPrice: string;
  strike?: string;
  isCall: boolean;
  side: "BUY" | "SELL";
}

export const useCalcIv = ({ unitPrice, strike, isCall, side }: useCalcIvProps) => {
  const { ithacaSDK, currentExpiryDate, currentSpotPrice } = useAppStore();
  const [iv, setIv] = useState<number | null>(0);
  const [greeks, setGreeks] = useState();

  const { unitPrice: remoteForwardPrice, isLoading: isRemoteForwardPriceLoading } = usePrice({
    isForward: true,
    optionType: "Forward",
    expiryDate: currentExpiryDate,
    strike: strike,
    side: side,
  });

  useEffect(() => {
    calcIv();
  }, [unitPrice, remoteForwardPrice, currentExpiryDate, strike, currentSpotPrice, isCall, side]);

  const calcIv = () => {
    if (!strike || isInvalidNumber(getNumber(unitPrice))) return "-";
    const current = dayjs();
    const expiry = readDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT);
    const diff = expiry.diff(current);
    const sigma = ithacaSDK.calculation.impliedVolatility(
      isCall,
      getNumber(remoteForwardPrice),
      getNumber(strike),
      dayjs.duration(diff).asYears(),
      getNumber(unitPrice)
    );
    setIv(sigma ? sigma * 100 : null);

    setGreeks(
      ithacaSDK.calculation.blackFormulaExtended(
        isCall,
        getNumber(remoteForwardPrice),
        getNumber(strike),
        dayjs.duration(diff).asYears(),
        sigma
      )
    );
  };

  const getIv = () => {
    if (isRemoteForwardPriceLoading || !iv) {
      return "-";
    }

    return `IV ${iv > 10 ? iv.toFixed(1) : iv.toFixed(2)}%`;
  };

  return {
    iv: getIv(),
    greeks,
  };
};
