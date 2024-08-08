import { transformTradingPrice } from "@/UI/utils/Numbers";
import { ApiService } from "../api.service";
import dayjs from "dayjs";
import { fetchSingleConfigKey } from "../environment.service";
import { DEFAULT_INPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
import { calculateBidAsk } from "./helpers";
import { Currency } from "@/utils/types";
import { getCurrency } from "@/UI/utils/Currency";
import {
  ApiResponse,
  FetchPrice,
  FetchPriceHelper,
  FetchPriceListParams,
  FetchTradePricingParams,
  QuotingParams,
  ReceivedContract,
} from "@/types/calc.api";
import { ApiDataResponse, ListResponse } from "@/types/api";

export const fetchPrice = async ({ optionType, date, strike }: FetchPrice): Promise<ApiResponse> => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");
  const apiService = new ApiService(apiUrl, 2000);
  return apiService.get("/api/calc/price", {
    params: {
      payoff: optionType,
      date: date,
      strike: strike,
    },
  });
};

export const fetchForwardPrice = async ({ date }: { date: string }): Promise<ApiResponse> => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");
  const apiService = new ApiService(apiUrl, 2000);
  return apiService.get("/api/calc/forward", {
    params: {
      date: date,
    },
  });
};

export const fetchQuotingParams = async ({
  currency = "WETH",
}: {
  currency?: Currency;
}): Promise<ApiDataResponse<QuotingParams>> => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");
  const apiService = new ApiService(apiUrl);
  return apiService.get("/api/calc/quoting/params", {
    params: {
      currency: getCurrency(currency),
    },
  });
};

export const fetchPriceList = async ({ contracts }: FetchPriceListParams): Promise<ListResponse<ReceivedContract>> => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");
  const apiService = new ApiService(apiUrl);
  return apiService.post("/api/calc/price_list", contracts);
};

// If option is forward, date is current date
// otherwise use date from expiry date
export const fetchPriceForUnit = async ({
  isForward,
  optionType,
  expiryDate,
  strike,
  currentSpotPrice,
  side,
  forcedSpread,
}: FetchPriceHelper): Promise<string | null> => {
  const dateInitial = formatDate(expiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, "YYYY-MM-DD");
  try {
    if (isForward) {
      const dateFinal = optionType === "NEXT_AUCTION" ? dayjs().format("YYYY-MM-DD") : dateInitial;
      const price = await fetchForwardPrice({ date: dateFinal });
      return transformTradingPrice(
        !side
          ? price.data
          : calculateBidAsk({
              midPrice: Number(price.data),
              optionType: "Forward",
              side: side,
              forcedSpread: forcedSpread,
              currentSpotPrice: currentSpotPrice,
            })
      );
    } else if (strike && strike !== "-") {
      const price = await fetchPrice({
        optionType: optionType,
        date: dateInitial,
        strike: strike,
      });
      return transformTradingPrice(
        !side
          ? price.data
          : calculateBidAsk({
              midPrice: Number(price.data),
              optionType: optionType,
              side: side,
              forcedSpread: forcedSpread,
              currentSpotPrice,
            })
      );
    }
  } catch (error) {
    console.error("fetchPriceForUnit__error", error);
    return null;
  }
  console.error("fetchPriceForUnit__error", "no price");
  return null;
};

export const fetchOrderModelPrices = async (
  orders: FetchTradePricingParams[]
): Promise<ListResponse<{ orderId: number; price: number }>> => {
  const apiUrl = await fetchSingleConfigKey("TRADING_URL");
  const apiService = new ApiService(apiUrl);
  return apiService.post("/api/calc/trade_pricer", orders);
};
