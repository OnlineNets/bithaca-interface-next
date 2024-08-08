import { FundLockState } from "@ithaca-finance/sdk";
import LogoEth from "../components/Icons/LogoEth";
import LogoUsdc from "../components/Icons/LogoUsdc";

// Types
export interface CollateralSummary extends FundLockState {
  currencyLogo: JSX.Element;
  walletBalance: string;
  isTransactionInProgress: boolean;
  positionCollateralRequirement: number;
  availableCollateral: number;
  fundsToBeReleased?: number;
}

export const TABLE_COLLATERAL_HEADERS: string[] = [
  "Assets",
  "Wallet Balance",
  "Available Collateral on Ithaca",
  "Funds to be Released",
  "Live Orders' Collateral Requirements",
  "Positions' Collateral Requirements",
  "",
];

export type TableCollateralSummary = {
  [token: string]: CollateralSummary;
};

// Table strategy data
export const TABLE_COLLATERAL_SUMMARY: TableCollateralSummary = {
  WETH: {
    isTransactionInProgress: false,
    currency: "WETH",
    currencyLogo: <LogoEth />,
    walletBalance: "0",
    fundLockValue: 0,
    orderValue: 0,
    settleValue: 0,
    positionCollateralRequirement: 0,
    availableCollateral: 0,
  },
  USDC: {
    isTransactionInProgress: false,
    currency: "USDC",
    currencyLogo: <LogoUsdc />,
    walletBalance: "0",
    fundLockValue: 0,
    orderValue: 0,
    settleValue: 0,
    positionCollateralRequirement: 0,
    availableCollateral: 0,
  },
};
