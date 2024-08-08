// Packages
import { useCallback, useEffect, useState } from "react";
import { useReadContracts, useAccount } from "wagmi";
import { formatUnits, isAddress, isAddressEqual } from "viem";

// Components
import Button from "@/UI/components/Button/Button";
import Sort from "@/UI/components/Icons/Sort";
import Flex from "@/UI/layouts/Flex/Flex";
import Pagination from "@/UI/components/Pagination/Pagination";
import Panel from "@/UI/layouts/Panel/Panel";
import Loader from "@/UI/components/Loader/Loader";
import StatsCard from "../StatsCard/StatsCard";
import Avatar from "../Icons/Avatar";
import Banner from "../EnjinstarterBanner/Banner";

// Constants
import { getCupIcon } from "@/UI/constants/badges";

import {
  ENJINSTARTER_LEADERBOARD_TABLE_HEADERS,
  EnjinstarterData,
  enjinstarterLeaderboardTableEnums,
  headerToKeyMap,
  EnjinstarterSortConfig,
} from "@/UI/constants/enjinstarter";
import { fundlockAbi } from "@/assets/abi/fundlockAbi";

// Utils
import { getTruncateEthAddress } from "@/UI/utils/Points";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";

// Services
import { useAppStore } from "@/UI/lib/zustand/store";

// Styles
import styles from "./EnjinstarterLeaderboard.module.scss";
import { arbitrum } from "viem/chains";
import { fundlockArbitrumAddress, usdcArbitrumAddress, wethArbitrumAddress } from "@/UI/constants/arbitrumAddresses";
import { useQuery } from "@tanstack/react-query";
import { getWalletsByReferralCode } from "@/UI/services/PointsAPI";
import { ResponseType } from "@/UI/constants/pointsProgram";

const EnjinstarterLeaderboard = () => {
  const [isLoadingPoints, setIsLoadingPoints] = useState<boolean>(false);
  const { systemInfo, currentSpotPrice } = useAppStore();
  const { address } = useAccount();
  const [page, setPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<EnjinstarterSortConfig>({
    key: "ranking",
    direction: "asc",
  });

  const referalCode = "HOAJZ";
  const { data: participatingWallets, isLoading: isParticipatingWalletsLoading } = useQuery<
    ResponseType<{ walletAddress: string; displayName: string }[]>,
    unknown,
    { walletAddress: string; displayName: string }[]
  >({
    enabled: !!referalCode,
    initialData: { data: [] },
    queryKey: ["refcode-leaderboard", referalCode],
    queryFn: () => getWalletsByReferralCode(referalCode),
    select: response => {
      if (response.error) {
        return [];
      }
      return response.data || [];
    },
  });

  const pageLimit = 10;

  const [data, setData] = useState<EnjinstarterData[]>([]);
  const sortableColumns = [
    enjinstarterLeaderboardTableEnums.RANKING,
    enjinstarterLeaderboardTableEnums.TRADING_BALANCE,
  ];

  const fetchUsdcBalancesArg = participatingWallets.map(wallet => ({
    address: fundlockArbitrumAddress,
    abi: fundlockAbi,
    functionName: "balanceSheet",
    args: [wallet.walletAddress, usdcArbitrumAddress],
    chainId: arbitrum.id,
  }));

  const fetchWethBalancesArg = participatingWallets.map(wallet => ({
    address: fundlockArbitrumAddress,
    abi: fundlockAbi,
    functionName: "balanceSheet",
    args: [wallet.walletAddress, wethArbitrumAddress],
    chainId: arbitrum.id,
  }));

  const { data: usdcBalances, error } = useReadContracts({ contracts: fetchUsdcBalancesArg });
  const { data: wethBalances } = useReadContracts({ contracts: fetchWethBalancesArg });

  const fetchBalancesAndPrepareLeaderboard = useCallback(async () => {
    if (!participatingWallets?.length || !wethBalances || !usdcBalances) {
      setData([]);
      return;
    }

    setIsLoadingPoints(true);
    try {
      const leaderboard = participatingWallets
        .map((wallet, index) => {
          if (usdcBalances[index].error) {
            return null;
          }
          const wethTradingBalance = wethBalances[index].result
            ? Number(formatUnits(wethBalances[index].result as bigint, systemInfo.tokenDecimals["WETH"])) *
              currentSpotPrice
            : 0;
          const usdcTradingBalance = Number(
            formatUnits(usdcBalances[index].result as bigint, systemInfo.tokenDecimals["USDC"])
          );
          return {
            displayName: wallet.displayName,
            user: wallet.walletAddress,
            tradingBalance: `${wethTradingBalance + usdcTradingBalance}`,
            percentageGain: `${wethTradingBalance + usdcTradingBalance}`,
          };
        })
        .filter(Boolean)
        .sort((a, b) => Number(b!.tradingBalance) - Number(a!.tradingBalance))
        .map((walletList, index) => ({ ...walletList, ranking: index + 1 }));
      setData(leaderboard as EnjinstarterData[]);
    } finally {
      setIsLoadingPoints(false);
    }
  }, [currentSpotPrice, systemInfo, participatingWallets, wethBalances, usdcBalances]);

  useEffect(() => {
    fetchBalancesAndPrepareLeaderboard();
  }, [fetchBalancesAndPrepareLeaderboard]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSort = (key: keyof EnjinstarterData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setData(
      data.sort((a, b) => (direction === "desc" ? Number(b[key]) - Number(a[key]) : Number(a[key]) - Number(b[key])))
    );
  };

  const getUserRanking = () => {
    return address && participatingWallets.find(a => a.walletAddress === address)
      ? data.find(leaderboard => isAddressEqual(leaderboard.user, address))?.ranking || 0
      : 0;
  };

  const getUserTradingBalance = () => {
    const tradingBalance =
      address && participatingWallets.find(a => a.walletAddress === address)
        ? data.find(leaderboard => isAddressEqual(leaderboard.user, address))?.tradingBalance || "0"
        : "0";
    return formatNumberByCurrency(Number(tradingBalance), "string", "USDC");
  };

  const isAnyLoading = isLoadingPoints || isParticipatingWalletsLoading;
  const isEmptyData = !isAnyLoading && !data.length;
  const showList = !isAnyLoading && !isEmptyData;

  return (
    <>
      <div className={styles.bannerWrapper}>
        <Banner title='Your Current Ranking' stat={getUserRanking()} />
      </div>
      <h1>Enjinstarter Trading Leaderboard</h1>
      <div className={styles.statsWrapper}>
        <StatsCard title='Your Current Ranking' stat={getUserRanking()} />
        <StatsCard title='Trading Balance USD Equivalent' stat={getUserTradingBalance()} />
      </div>
      <Panel className={styles.wrapper}>
        <div className={styles.table}>
          {isAnyLoading && (
            <div className={styles.loader}>
              <Loader type='lg' />
            </div>
          )}
          {isEmptyData && (
            <div className={styles.emptyData}>
              <p>No data available.</p>
            </div>
          )}
          {showList && (
            <>
              <div className={styles.header}>
                {ENJINSTARTER_LEADERBOARD_TABLE_HEADERS.map((header, idx) => {
                  const isSortable = sortableColumns.includes(header);
                  const sortKey = headerToKeyMap[header];

                  return (
                    <div className={styles.cell} key={idx}>
                      {header}
                      {isSortable && (
                        <Button
                          title='Click to sort column'
                          className={styles.sort}
                          onClick={() => handleSort(sortKey)}
                        >
                          <Sort />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              {data
                .slice(page > 1 ? page + pageLimit - 2 : 0, Math.min(page * pageLimit, data.length))
                .map(({ ranking, user, percentageGain, tradingBalance, displayName }) => {
                  let displayLabel = getTruncateEthAddress(user);
                  if (!!displayName && displayName !== address) {
                    displayLabel = isAddress(displayName) ? getTruncateEthAddress(user) : displayName;
                  }

                  return (
                    <div className={styles.row} key={ranking}>
                      <div className={styles.cell}>
                        {ranking <= 3 ? (
                          <p className={styles[`prizePlace-${ranking}`]}>
                            {ranking} {getCupIcon(ranking)}
                          </p>
                        ) : (
                          ranking
                        )}
                      </div>
                      <div className={styles.cell}>
                        <Avatar />
                        {`${displayLabel} ${address && isAddressEqual(address, user) ? "(You)" : ""}`}
                      </div>
                      <div className={`${styles.cell}, ${styles.grey}`}>
                        Coming Soon
                        {/*formatNumberByCurrency(Number(percentageGain), "string", "USDC", 2) +
                          (percentageGain === "0" ? "" : "%")*/}
                      </div>
                      <div className={styles.cell}>
                        {formatNumberByCurrency(Number(tradingBalance), "string", "USDC", 2)}
                      </div>
                    </div>
                  );
                })}
              {data.length > pageLimit ? (
                <div className={styles.paginationContainer}>
                  <Flex direction='row-space-between'>
                    <div />
                    <Pagination
                      className={styles.pagination}
                      totalItems={data.length}
                      itemsPerPage={pageLimit}
                      currentPage={page}
                      onPageChange={handlePageChange}
                    />
                  </Flex>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Panel>
    </>
  );
};

export default EnjinstarterLeaderboard;
