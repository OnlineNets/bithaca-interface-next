import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

export type ProductType = Record<string, ProductOption[]>;

export type ProductOption = {
  option: string;
  value: string;
};

export const PRODUCT_OPTIONS: ProductOption[] = [
  {
    option: "Option",
    value: "option",
  },
  {
    option: "Digital Option",
    value: "digital-option",
  },
  {
    option: "Forward",
    value: "Forward",
  },
];

export const PRODUCT_TYPES: ProductType = {
  option: [
    {
      option: "Call",
      value: "Call",
    },
    {
      option: "Put",
      value: "Put",
    },
  ],
  "digital-option": [
    {
      option: "Call",
      value: "BinaryCall",
    },
    {
      option: "Put",
      value: "BinaryPut",
    },
  ],
  Forward: [
    {
      option: "Next Auction",
      value: "NEXT_AUCTION",
    },
    {
      option: "Call",
      value: "CURRENT",
    },
  ],
};

export const getProductTypes = (currentExpiryDate: number): ProductType => {
  return {
    option: [
      {
        option: "Call",
        value: "Call",
      },
      {
        option: "Put",
        value: "Put",
      },
    ],
    "digital-option": [
      {
        option: "Call",
        value: "BinaryCall",
      },
      {
        option: "Put",
        value: "BinaryPut",
      },
    ],
    Forward: [
      {
        option: "Next Auction",
        value: "NEXT_AUCTION",
      },
      {
        option: formatDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT),
        value: "CURRENT",
      },
    ],
  };
};
