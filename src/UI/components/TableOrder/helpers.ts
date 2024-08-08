import {
  TABLE_ORDER_HEADERS,
  TABLE_ORDER_HEADERS_FOR_POSITIONS,
  TABLE_ORDER_LIVE_ORDERS,
  TableRowDataWithExpanded,
  PositionRow,
  TABLE_TYPE,
  PositionWithOrders,
  TABLE_ORDER_SETTLEMENTS,
  Settlements,
  SettlementRow,
  TABLE_HISTORY_HEADERS,
  PositionsExpandedRow,
} from "./types";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
import { NEXT_AUCTION } from "@/UI/utils/constants";
import { Currency, SideUnion } from "@/utils/types";
import { Contract, Detail, Order } from "@ithaca-finance/sdk";
import dayjs from "dayjs";

export const transformSettlementsOrders = (data: Settlements, unFilteredContractList: Contract[]) => {
  const settlements = Object.keys(data).map(key => {
    const basicCurrencyPair = Object.keys(data[key].expiryPrices)[0];
    const tenor = formatDate(key.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
    return {
      tenor: tenor === NEXT_AUCTION ? "Next Auction" : tenor,
      currencyPair: basicCurrencyPair,
      settlementPrice: data[key].expiryPrices[basicCurrencyPair],
      payout: data[key].payoff[basicCurrencyPair],
      totalCollateral: data[key].totalCollateral[basicCurrencyPair],
      expandedInfo: data[key].positions.map(singlePosition => {
        const contract = unFilteredContractList.find(contract => contract.contractId === singlePosition.contractId);
        const tenorInternal = formatDate(key.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
        return {
          tenor: tenorInternal === NEXT_AUCTION ? "Next Auction" : tenorInternal,
          product: contract?.payoff || "",
          strike: `${contract?.economics.strike ?? ""}`,
          avgPrice: singlePosition.positionsAvgPrice,
          quantity: singlePosition.positionsQty,
        };
      }),
    };
  });

  // Do not return empty settlements (without positions)
  return settlements.filter(item => item.expandedInfo.length > 0);
};

function removeDuplicatedOrders(orders: Order[]): Order[] {
  const uniqueOrders = new Map();

  // Push last and unique element
  for (let i = orders.length - 1; i >= 0; i--) {
    const order = orders[i];
    const orderId = order.orderId;

    if (!uniqueOrders.has(orderId)) {
      uniqueOrders.set(orderId, order);
    }
  }

  return Array.from(uniqueOrders.values()).reverse();
}

export const formatOrderStatus = (status: string) => {
  return status
    .split("_")
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const calculateFill = (details: Detail[]): number => {
  const fills = details.map(detail => {
    if (detail.originalQty > 0) {
      return ((detail.originalQty - detail.remainingQty) / detail.originalQty) * 100;
    }
    return 0;
  });

  const totalFill = fills.reduce((acc, fill) => acc + fill, 0);
  const averageFill = totalFill / details.length;

  return averageFill;
};

const uniqueStrikes = (strikes: Contract["economics"]["strike"][]): number[] => {
  const uniqueStrikes = Array.from(new Set(strikes));
  return uniqueStrikes.filter((strike): strike is number => typeof strike === "number");
};

const parseExpiry = (expiry: number) => {
  const parsedExpiry = formatDate(expiry.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
  if (parsedExpiry == NEXT_AUCTION) return "Next Auction";
  return parsedExpiry;
};

export const transformClientOpenOrders = (orders: Order[]) => {
  return removeDuplicatedOrders(orders).map(row => {
    const side = new Set<"BUY" | "SELL">();
    const strikes: (number | undefined)[] = [];

    for (const detail of row.details) {
      side.add(detail.side);
      strikes.push(detail.contractDto.economics.strike);
    }

    return {
      clientOrderId: row.orderId,
      orderDate: dayjs(row.revDate).format("DDMMMYY HH:mm"),
      currencyPair: row.collateral?.currencyPair || row.details[0].currencyPair,
      product: row.orderDescr,
      side: side.size === 1 ? Array.from(side)[0] : "",
      tenor: parseExpiry(row.details[0].expiry),
      wethAmount: row.collateral?.underlierAmount,
      usdcAmount: row.collateral?.numeraireAmount,
      orderLimit: row.netPrice,
      orderStatus: row.orderStatus,
      fill: calculateFill(row.details),
      strikeGroup: uniqueStrikes(strikes),
      modelPrice: 0, // TODO: create separate types for trade history and live orders
      expandedInfo: row.details.map(leg => ({
        type: leg.contractDto.payoff,
        side: leg.side,
        expiryDate: parseExpiry(leg.expiry),
        expiryUnparsed: leg.expiry,
        size: leg.originalQty,
        sizeCurrency: leg.contractDto.economics.qtyCurrency as Currency,
        strike: leg.contractDto.economics.strike,
        averageExecutionPrice: leg.execPrice,
      })),
    };
  });
};

export const transformPositionsOrders = (data: PositionWithOrders[], unFilteredContractList: Contract[]) => {
  return data.map(row => {
    const contract = unFilteredContractList.find(contract => contract.contractId === row.contractId);
    return {
      tenor: contract?.economics.expiry
        ? formatDate(contract?.economics.expiry.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT)
        : "",
      product: contract?.payoff,
      strike: contract?.economics.strike || "",
      quantity: row.positionsQty,
      averagePrice: row.positionsAvgPrice,
      expandedInfo: row.orders.map((singleOrder, index) => {
        const side = new Set<SideUnion>();
        for (const detail of singleOrder.details) {
          side.add(detail.side);
        }

        return {
          type: contract?.payoff,
          orderDate: formatDate(singleOrder.revDate, undefined, DEFAULT_OUTPUT_DATE_FORMAT),
          currencyPair: singleOrder.details[0].currencyPair,
          product: singleOrder.orderDescr,
          tenor: singleOrder?.details?.[0]?.expiry
            ? formatDate(
                singleOrder.details[0].expiry.toString(),
                DEFAULT_INPUT_DATE_FORMAT,
                DEFAULT_OUTPUT_DATE_FORMAT
              )
            : "",
          orderLimit: singleOrder.netPrice,
          side: side.size === 1 ? Array.from(side)[0] : "",
          averageSize:
            singleOrder.details.reduce((acc, detail) => acc + (detail.originalQty ?? 0), 0) /
            singleOrder.details.length,
          averageExecutionPrice:
            singleOrder.details.reduce((acc, detail) => acc + (detail.execPrice ?? 0), 0) / singleOrder.details.length,
        } as PositionsExpandedRow;
      }),
    };
  }) as PositionRow[];
};

export const getTableHeaders = (type: TABLE_TYPE) => {
  switch (type) {
    case TABLE_TYPE.ORDER:
      return TABLE_ORDER_HEADERS_FOR_POSITIONS;
    case TABLE_TYPE.LIVE:
      return TABLE_ORDER_LIVE_ORDERS;
    case TABLE_TYPE.SETTLEMENTS:
      return TABLE_ORDER_SETTLEMENTS;
    case TABLE_TYPE.HISTORY:
      return TABLE_HISTORY_HEADERS;
    default:
      return TABLE_ORDER_HEADERS;
  }
};

// Sorting
export const sortNumberValues = (data: PositionRow[], sortingKey: keyof PositionRow, asc: boolean) => {
  if (asc) {
    data.sort((a, b) => Number(a[sortingKey]) - Number(b[sortingKey]));
  } else {
    data.sort((a, b) => Number(b[sortingKey]) - Number(a[sortingKey]));
  }
  return data;
};

export const sortNumberValuesForSettlements = (
  data: SettlementRow[],
  sortingKey: keyof SettlementRow,
  asc: boolean
) => {
  if (asc) {
    data.sort((a, b) => Number(a[sortingKey]) - Number(b[sortingKey]));
  } else {
    data.sort((a, b) => Number(b[sortingKey]) - Number(a[sortingKey]));
  }
  return data;
};
