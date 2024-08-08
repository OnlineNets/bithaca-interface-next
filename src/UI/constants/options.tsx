import Minus from "../components/Icons/Minus";
import Plus from "../components/Icons/Plus";
import { ReactNode } from "react";

// Types
type OptionProps = {
  option: ReactNode;
  value: string;
};

export const TYPE_OPTIONS: OptionProps[] = [
  { option: "Call", value: "Call" },
  { option: "Put", value: "Put" },
];

export const DIGITAL_OPTIONS: OptionProps[] = [
  { option: "Call", value: "BinaryCall" },
  { option: "Put", value: "BinaryPut" },
];

export const SIDE_OPTIONS: OptionProps[] = [
  { option: <Plus />, value: "BUY" },
  { option: <Minus />, value: "SELL" },
];

export const BET_OPTIONS: OptionProps[] = [
  { option: "Inside Range", value: "INSIDE" },
  { option: "Outside Range", value: "OUTSIDE" },
];

export const BONUS_TWIN_WIN_OPTIONS: OptionProps[] = [
  { option: "Bonus", value: "Bonus" },
  { option: "Twin-Win", value: "Twin Win" },
];

export const RISKY_RISKLESS_EARN_OPTIONS: OptionProps[] = [
  { option: "Risky Earn", value: "Risky Earn" },
  { option: "RiskLess Earn", value: "Riskless Earn" },
];

export const UP_DOWN_OPTIONS: OptionProps[] = [
  { option: "UP", value: "UP" },
  { option: "DOWN", value: "DOWN" },
];

export const IN_OUT_OPTIONS: OptionProps[] = [
  { option: "IN", value: "IN" },
  { option: "OUT", value: "OUT" },
];
