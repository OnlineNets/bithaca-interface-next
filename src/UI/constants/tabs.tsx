// Packages
import { ReactNode } from "react";

// Types
type Tab = {
  id: string;
  label: string;
  content?: ReactNode;
  path?: string;
};

export const TRADING_TABS_ITEMS: Tab[] = [
  {
    id: "market",
    path: "/trading/market",
    label: "Market",
  },
  {
    id: "stories",
    path: "/trading/stories",
    label: "Stories",
  },
  {
    id: "position-builder",
    path: "/trading/position-builder",
    label: "Position Builder",
  },
  {
    id: "dynamic-option-strategies",
    path: "/trading/dynamic-option-strategies",
    label: "Dynamic Option Strategies",
  },
];

export const POINTS_TABS_ITEMS: Tab[] = [
  {
    id: "seasonOne",
    path: "/points/season-one",
    label: "Season One",
  },
  {
    id: "referral",
    path: "/points/referral",
    label: "Referral",
  },
  {
    id: "profile",
    path: "/points/profile",
    label: "Profile",
  },
  {
    id: "history",
    path: "/points/history",
    label: "History",
  },
];

export const MODAL_TABS: Tab[] = [
  {
    id: "deposit",
    label: "Deposit",
    // content: <p>Content deposit</p>,
  },
  {
    id: "withdraw",
    label: "Withdraw",
    // content: <p>Content for withdraw</p>,
  },
];
