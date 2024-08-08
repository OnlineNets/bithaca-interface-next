// Packages
import { ReactNode } from "react";

// Components
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

export type CardProps = {
  title: string;
  address: string;
  label: string;
  value: number;
  icon?: ReactNode;
  currency?: string;
};

export const LEADERBOARD_CARDS: CardProps[] = [
  {
    title: "The Highest Volume",
    address: "0x4c31...c0ed",
    label: "Trading Volume",
    value: 593100,
    icon: <LogoUsdc />,
    currency: "USDC",
  },
  {
    title: "The Most Profitable",
    address: "0x4c31...c0ed",
    label: "PnL (USDC)",
    value: -33100,
    icon: <LogoUsdc />,
    currency: "USDC",
  },
  {
    title: "The Most Efficient",
    address: "0x4c31...c0ed",
    label: "PnL (%)",
    value: 428.4,
  },
  {
    title: "The Most Active",
    address: "0x4c31...c0ed",
    label: "Closed Contracts",
    value: 293,
  },
];
