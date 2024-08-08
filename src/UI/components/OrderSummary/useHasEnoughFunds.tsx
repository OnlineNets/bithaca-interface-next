import { useUserBalance } from "@/UI/hooks/useUserBalance";
import { isInvalidNumber } from "@/UI/utils/Numbers";
import { OrderSummaryType } from "@/types/orderSummary";
import { useMemo } from "react";

interface UseHasEnoughFundsProps {
  orderSummary: OrderSummaryType | undefined;
}

export const useHasEnoughFunds = ({ orderSummary }: UseHasEnoughFundsProps) => {
  const { collateralSummary } = useUserBalance();
  const hasEnoughFunds = useMemo(() => {
    // Premium value is used only for validation if backend returned any number
    const premiumValue = Math.abs(Number(orderSummary?.order.totalNetPrice));

    const collateralRequirementWETH =
      (orderSummary?.orderLock?.underlierAmount || 0) - collateralSummary["WETH"].orderValue;
    const collateralRequirementUSDC =
      (orderSummary?.orderLock?.numeraireAmount || 0) - collateralSummary["USDC"].orderValue;

    const fundlockUSDC = collateralSummary["USDC"].fundLockValue;
    const fundlockWETH = collateralSummary["WETH"].fundLockValue;

    // availableCollateral = fundlockUSDC.fundLockValue - fundlockUSDC.orderValue - fundlockUSDC.settleValue,
    const remainingBalanceUSDC = collateralSummary["USDC"].availableCollateral;
    const remainingBalanceWETH = collateralSummary["WETH"].availableCollateral;

    let totalRequiredUSDC = 0;
    if (collateralRequirementUSDC > 0) {
      totalRequiredUSDC += collateralRequirementUSDC;
    }

    let totalRequiredWETH = 0;
    if (collateralRequirementWETH > 0) {
      totalRequiredWETH += collateralRequirementWETH;
    }

    // Please leave these ifs as simple to read as possible
    if (premiumValue !== 0 && isInvalidNumber(premiumValue)) {
      console.log("Submit button validation - Invalid premium value", premiumValue);
      return false;
    }

    if (totalRequiredUSDC) {
      const notEnoughUSDC = totalRequiredUSDC > remainingBalanceUSDC;
      if (isInvalidNumber(fundlockUSDC) || notEnoughUSDC) {
        console.log("#### Submit button validation - Invalid USDC #####");
        console.log("fundlockUSDC", fundlockUSDC);
        console.log("totalRequiredUSDC", totalRequiredUSDC);
        console.log("remainingBalanceUSDC", remainingBalanceUSDC);
        console.log("totalRequiredUSDC > remainingBalanceUSDC", notEnoughUSDC);
        return false;
      }
    }

    if (totalRequiredWETH) {
      const notEnoughWETH = totalRequiredWETH > remainingBalanceWETH;
      if (isInvalidNumber(fundlockWETH) || notEnoughWETH) {
        console.log("##### Submit button validation - Invalid WETH #######");
        console.log("fundlockWETH", fundlockWETH);
        console.log("totalRequiredWETH", totalRequiredWETH);
        console.log("remainingBalanceWETH", remainingBalanceWETH);
        console.log("totalRequiredWETH > remainingBalanceWETH", notEnoughWETH);

        return false;
      }
    }

    return true;
  }, [orderSummary, collateralSummary]);

  return {
    hasEnoughFunds,
  };
};
