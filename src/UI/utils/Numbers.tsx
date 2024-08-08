import { Currency } from "@/utils/types";

export const getNumberValue = (value: string): string => {
  if (!value) return "";

  // remove spaces from string
  value = value.replace(/\s/g, "");
  // remove aphats from string
  value = value.replace(/[^.\d]/g, "");

  return value;
};

// Converts 1e-8 to 0.00
export const transformTradingPrice = (scientificNumber: number) => {
  return `${scientificNumber.toFixed(2)}`;
};

export const getNumber = (value: string): number => {
  return Number(getNumberValue(value));
};

export const isInvalidNumber = (number: number) => !number || isNaN(number) || number <= 0;

export const getNumberFormat = (value: string | number, type: string = "int") => {
  let result = "0";
  const number = getNumber(value.toString());
  if (isInvalidNumber(number)) {
    return "0";
  } else {
    result = formatNumber(number, type);
  }
  return result;
};

export const formatNumber = (value: number, type: string, fixed = 1) => {
  let isNeg = false;
  if (value < 0) {
    isNeg = true;
  }
  if (value === 0) {
    return "0";
  }
  if (!value) return "-";
  if (value * (isNeg ? -1 : 1) >= 1000000000) {
    return (value / 1000000000).toFixed(6) + "B";
  } else if (value * (isNeg ? -1 : 1) >= 1000000) {
    return (value / 1000000).toFixed(3) + "M";
  } else if (value * (isNeg ? -1 : 1) >= 1000) {
    return (value / 1000).toFixed(fixed) + "K";
  } else {
    return type == "int" ? Math.round(value)?.toString() : Number(value)?.toFixed(fixed)?.toString();
  }
};

const formatDividedValue = (value: number, divisor: number, suffix: string, fixedPlaces?: number) => {
  const dividedValue = value / divisor;
  const digits = Math.floor(Math.log10(dividedValue) + 1);
  const decimalPlaces = 4 - digits;
  return dividedValue.toFixed(fixedPlaces ?? decimalPlaces > 0 ? decimalPlaces : 0) + suffix;
};

/**
 * Formats a number by a specific currency.
 *
 * @param {number} value - The number to format.
 * @param {string} type - The type of the number (e.g., 'string').
 * @param {string} currency - The currency to use for formatting (e.g., 'WETH', 'USDC').
 *
 * @returns {string} The formatted number.
 *
 * @example
 * // For             'WETH'      and         'USDC':
 * //            1 => 1.000 |            1 => 1.00
 * //           12 => 12.000 |           12 => 12.00
 * //          123 => 123.00 |          123 => 123.00
 * //        1234 => 1234.0  |        1234 => 1234.0
 * //       12345 => 12345   |       12345 => 12345
 * //      123456 => 123.5K  |      123456 => 123.5K
 * //     1234567 => 1.235M  |     1234567 => 1.235M
 * //    12345678 => 12.35M  |    12345678 => 12.35M
 * //   123456789 => 123.5M  |   123456789 => 123.5M
 * //  1234567890 => 1.235B  |  1234567890 => 1.235B
 * // 12345678900 => 12.35B  | 12345678900 => 12.35B
 * //123456789000 => 123.5B  |123456789000 => 123.5B
 * //1234567890000 => 1.235T |1234567890000 => 1.235T
 */
export const formatNumberByCurrency = (
  value: number,
  type?: string,
  currency?: Currency,
  fixedPlaces?: number,
  returnAbsValue?: boolean
) => {
  const absValue = value * (value < 0 ? -1 : 1);
  const finalValueToUse = returnAbsValue ? absValue : value;

  if (!finalValueToUse) return "-";

  if (absValue > 1000000000000) {
    return formatDividedValue(finalValueToUse, 1000000000000, "T", fixedPlaces);
  } else if (absValue > 1000000000) {
    return formatDividedValue(finalValueToUse, 1000000000, "B", fixedPlaces);
  } else if (absValue > 1000000) {
    return formatDividedValue(finalValueToUse, 1000000, "M", fixedPlaces);
  } else if (absValue > 99999) {
    return formatDividedValue(finalValueToUse, 1000, "K", fixedPlaces);
  } else if (absValue >= 99) {
    return finalValueToUse.toFixed(fixedPlaces ?? 5 - Math.floor(Math.log10(absValue) + 1));
  } else {
    switch (currency) {
      case "USDC":
        return finalValueToUse.toFixed(fixedPlaces ?? 2);
      case "WETH":
        return finalValueToUse.toFixed(fixedPlaces ?? 3);
      default:
        return finalValueToUse.toFixed(fixedPlaces ?? 2);
    }
  }
};

export const formatNumberByFixedPlaces = (value: number, fixedPlaces: number, returnAbsValue?: boolean) => {
  return formatNumberByCurrency(value, undefined, undefined, fixedPlaces, returnAbsValue);
};

export const formatEthAddress = (text: string) => (text ? `${text.slice(0, 4)}...${text.slice(-4)}` : "");
