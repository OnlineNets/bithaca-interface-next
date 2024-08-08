import { ClientConditionalOrder, Leg, OrderLock } from "@ithaca-finance/sdk";

export type OrderSummaryType = {
  order: ClientConditionalOrder;
  orderLock: OrderLock | null;
  orderFees: OrderLock | null;
};
