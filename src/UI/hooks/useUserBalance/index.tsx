import { TABLE_COLLATERAL_SUMMARY } from "@/UI/constants/tableCollateral";
import { useAppStore } from "@/UI/lib/zustand/store";
import { Currency, SelectedCurrency } from "@/utils/types";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { sumLockedCollateral } from "./helpers";
import { useBalanceData } from "./useBalanceData";

export const useUserBalance = () => {
  const [collateralSummary, setCollateralSummary] = useState(TABLE_COLLATERAL_SUMMARY);
  const { isAuthenticated } = useAppStore();

  const {
    WETHData: { data: balanceWETH },
    USDCData: { data: balanceUSDC },
    lockedCollateralData: { data: lockedCollateral },
    fundLockStateData: { data: fundLockState },
  } = useBalanceData();

  useEffect(() => {
    if (!isAuthenticated) {
      setCollateralSummary(TABLE_COLLATERAL_SUMMARY);
      return;
    }

    if (!fundLockState || !lockedCollateral || !balanceUSDC || !balanceWETH) return;

    const getFundlockData = (currency: Currency) => fundLockState.find(fundlock => fundlock.currency === currency) || 0;

    const fundlockWETH = getFundlockData("WETH");
    const fundlockUSDC = getFundlockData("USDC");

    const hasWETHChanged = fundlockWETH.fundLockValue !== collateralSummary["WETH"]?.fundLockValue;
    const hasUSDCChanged = fundlockUSDC.fundLockValue !== collateralSummary["USDC"]?.fundLockValue;

    const lockedCollateralData = sumLockedCollateral(lockedCollateral);

    setCollateralSummary(summary => ({
      WETH: {
        ...summary.WETH,
        ...fundlockWETH,
        positionCollateralRequirement: lockedCollateralData.totalUnderlierAmount,
        availableCollateral: fundlockWETH.fundLockValue - fundlockWETH.orderValue - fundlockWETH.settleValue,
        walletBalance: formatUnits(balanceWETH.value, balanceWETH.decimals),
        isTransactionInProgress: hasWETHChanged ? false : summary["WETH"].isTransactionInProgress,
      },
      USDC: {
        ...summary.USDC,
        ...fundlockUSDC,
        positionCollateralRequirement: lockedCollateralData.totalNumeraireAmount,
        availableCollateral: fundlockUSDC.fundLockValue - fundlockUSDC.orderValue - fundlockUSDC.settleValue,
        walletBalance: formatUnits(balanceUSDC.value, balanceUSDC.decimals),
        isTransactionInProgress: hasUSDCChanged ? false : summary["USDC"].isTransactionInProgress,
      },
    }));
  }, [isAuthenticated, fundLockState, lockedCollateral, balanceUSDC, balanceWETH]);

  const handleFetchingBalance = (status: boolean, selectedCurrency?: SelectedCurrency) => {
    if (selectedCurrency?.name) {
      const item = selectedCurrency.name;
      setCollateralSummary(summary => ({
        ...summary,
        [item]: { ...summary[item], isTransactionInProgress: !status },
      }));
    }
  };

  return {
    collateralSummary,
    handleFetchingBalance,
  };
};
