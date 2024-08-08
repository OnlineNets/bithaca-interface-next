// Packages
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress, isAddressEqual } from "viem";
import Image from "next/image";

// Layouts
import Panel from "@/UI/layouts/Panel/Panel";
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import Loader from "../Loader/Loader";
import Avatar from "../Icons/Avatar";
import ProfileImage from "../ProfileImage/ProfileImage";
import Sort from "../Icons/Sort";
import Button from "../Button/Button";

// Utils
import { formatNumber, getTruncateEthAddress } from "@/UI/utils/Points";

// Constants
import { getCupIcon } from "@/UI/constants/badges";

// Services
import { getLeaderboard24Hr } from "@/UI/services/PointsAPI";

// Types
import { GetUserStatsResponse, LeaderboardUser24Hr } from "@/types/Stats";

// Styles
import styles from "./SeasonLeaderboard.module.scss";

type SeasonLeaderboardProps = {
  userStats?: GetUserStatsResponse;
  page: number;
  setPage: (page: number) => void;
  sortConfig: "asc" | "desc";
  setSortConfig: (newSortConfig: "asc" | "desc") => void;
  pageLimit: number;
};

const seasonLeaderboardHeaders = [
  { name: "Ranking", sortable: true },
  { name: "User", sortable: false },
  { name: "Booster Badge", sortable: false },
  { name: "24hr Trading Points", sortable: false },
];

function SeasonLeaderboard({ userStats, page, setPage, sortConfig, setSortConfig, pageLimit }: SeasonLeaderboardProps) {
  const { address } = useAccount();

  const [data, setData] = useState<LeaderboardUser24Hr[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSort = () => {
    setSortConfig(sortConfig === "asc" ? "desc" : "asc");
  };

  useEffect(() => {
    getLeaderboard24Hr({
      page,
      pageSize: pageLimit,
      sortType: sortConfig,
    }).then(({ data }) => {
      if (!data) return;
      setData(data.leaderboard);
      setTotalEntries(data.totalEntries);
    });
  }, [page, pageLimit, sortConfig]);

  return (
    <Panel className={styles.wrapper}>
      <div className={styles.table}>
        {!data.length ? (
          <div className={styles.loader}>
            <Loader type='lg' />
          </div>
        ) : (
          <>
            <div className={styles.header}>
              {seasonLeaderboardHeaders.map((header, idx) => (
                <div className={styles.cell} key={idx}>
                  {header.name}
                  {header.sortable && (
                    <Button title='Click to sort column' className={styles.sort} onClick={handleSort}>
                      <Sort />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {userStats?.stats24hr?.ranking && (
              <div className={styles.row}>
                <div className={styles.cell}>
                  {userStats.stats24hr.ranking <= 3 ? (
                    <p className={styles[`prizePlace-${userStats.stats24hr.ranking}`]}>
                      {userStats.stats24hr.ranking} {getCupIcon(userStats.stats24hr.ranking)}
                    </p>
                  ) : (
                    userStats.stats24hr.ranking
                  )}
                </div>
                <div className={styles.cell}>
                  {userStats.avatarUrl ? (
                    <ProfileImage
                      width={30}
                      height={30}
                      className={styles.avatar}
                      src={userStats.avatarUrl}
                      alt='Leaderboard avatarUrl'
                    />
                  ) : (
                    <Avatar />
                  )}
                  {address && isAddressEqual(userStats.walletAddress, address)
                    ? "You"
                    : isAddress(userStats.displayName)
                      ? getTruncateEthAddress(userStats.displayName)
                      : userStats.displayName}
                </div>
                <div className={styles.cell}>
                  {userStats.stats24hr.badgeName && userStats.stats24hr.badgeImageUrl && (
                    <Image
                      src={`/images/badges/${userStats.stats24hr.badgeImageUrl}`}
                      alt={userStats.stats24hr.badgeName}
                      width={48}
                      height={48}
                    />
                  )}
                </div>
                <div className={styles.cell}>{`${formatNumber(
                  userStats.stats24hr.mainnetTradingPoints,
                  2
                )} Points`}</div>
              </div>
            )}
            {data.map(
              ({
                id,
                ranking,
                walletAddress,
                displayName,
                isAvatar,
                avatarUrl,
                badgeName,
                badgeImageUrl,
                mainnetTradingPoints,
              }) => (
                <div className={styles.row} key={id}>
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
                    {isAvatar && avatarUrl ? (
                      <ProfileImage
                        width={30}
                        height={30}
                        className={styles.avatar}
                        src={avatarUrl}
                        alt='Leaderboard avatarUrl'
                      />
                    ) : (
                      <Avatar />
                    )}
                    {address && isAddressEqual(walletAddress, address)
                      ? "You"
                      : isAddress(displayName)
                        ? getTruncateEthAddress(displayName)
                        : displayName}
                  </div>
                  <div className={styles.cell}>
                    {badgeName && badgeImageUrl && (
                      <Image
                        className={styles.badgeImage}
                        src={`/images/badges/${badgeImageUrl}`}
                        alt={badgeName}
                        width={48}
                        height={48}
                      />
                    )}
                  </div>
                  <div className={styles.cell}>{`${formatNumber(mainnetTradingPoints, 2)} Points`}</div>
                </div>
              )
            )}
            <div className={styles.paginationContainer}>
              <Flex direction='row-space-between'>
                <div />
                {/*<Pagination
                  className={styles.pagination}
                  totalItems={totalEntries}
                  itemsPerPage={pageLimit}
                  currentPage={page}
                  onPageChange={handlePageChange}
                    />*/}
              </Flex>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

export default SeasonLeaderboard;
