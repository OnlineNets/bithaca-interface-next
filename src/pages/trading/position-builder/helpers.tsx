import { ReactNode } from "react";

import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

export type ProductOption = {
  option: string;
  value: string;
  options: { option: string; value: string }[];
  sizeIcon: ReactNode;
};

export const getProductOptions = (currentExpiryDate: number): ProductOption[] => [
  {
    option: "Options",
    value: "options",
    sizeIcon: <LogoEth />,
    options: [
      { option: "Call", value: "Call" },
      { option: "Put", value: "Put" },
    ],
  },
  {
    option: "Digital Options",
    value: "digital-options",
    sizeIcon: <LogoUsdc />,
    options: [
      { option: "Call", value: "BinaryCall" },
      { option: "Put", value: "BinaryPut" },
    ],
  },
  {
    option: "Forwards",
    value: "forwards",
    sizeIcon: <LogoEth />,
    options: [
      { option: "Next Auction", value: "NEXT_AUCTION" },
      {
        option: formatDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT),
        value: "Forward",
      },
    ],
  },
];

// solves issue: found page without a React Component as default export
export default getProductOptions;
