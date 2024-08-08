import { TableHeaders } from "../components/TableOrder/types";

// Table fund lock headers
export const TABLE_FUND_LOCK_HEADERS: TableHeaders[] = [
  { name: "Date", style: {} },
  { name: "Currency", style: { justifyContent: "flex-start" } },
  { name: "Action", style: {} },
  { name: "Amount", style: { justifyContent: "flex-end", display: "flex" } },
  { name: "", style: {} },
  { name: "", style: {} },
];

// Define a type for the data structure
export type TableFundLockDataProps = {
  timestamp: string;
  orderDate: string;
  asset: string;
  auction: string;
  amount: string;
  currency: string;
  transactionHash: `0x${string}`;
  withdrawalSlot?: string;
  token: `0x${string}`;
};
