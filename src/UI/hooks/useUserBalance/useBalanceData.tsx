import { TABLE_COLLATERAL_SUMMARY } from "@/UI/constants/tableCollateral";
import { useAppStore } from "@/UI/lib/zustand/store";
import { getActiveChain } from "@/UI/utils/RainbowKitHelpers";
import { Currency, SelectedCurrency } from "@/utils/types";
import { FundLockState, LockedCollateralResponse } from "@ithaca-finance/sdk";
import { useQuery } from "@tanstack/react-query";
// import { FetchBalanceResult } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { sumLockedCollateral } from "./helpers";

export const useBalanceData = () => {
  const { systemInfo, ithacaSDK, isAuthenticated } = useAppStore();
  const { address } = useAccount();

  const defaultProps = {
    address,
    chainId: getActiveChain().id,
  };

  const WETHData = useBalance({
    ...defaultProps,
    token: systemInfo.tokenAddress["WETH"] as `0x${string}`,
    query: {
      enabled: isAuthenticated,
      refetchInterval: 10_000,
    },
  });

  const USDCData = useBalance({
    ...defaultProps,
    token: systemInfo.tokenAddress["USDC"] as `0x${string}`,
    query: {
      enabled: isAuthenticated,
      refetchInterval: 10_000,
    },
  });

  const lockedCollateralData = useQuery({
    queryKey: ["lockedCollateral"],
    queryFn: () => ithacaSDK.client.getLockedCollateral(),
    enabled: isAuthenticated,
    refetchInterval: 10_000,
  });

  const fundLockStateData = useQuery({
    queryKey: ["fundLockState"],
    queryFn: () => ithacaSDK.client.fundLockState(),
    enabled: isAuthenticated,
    refetchInterval: 10_000,
  });

  return {
    WETHData,
    USDCData,
    lockedCollateralData,
    fundLockStateData,
  };
};
