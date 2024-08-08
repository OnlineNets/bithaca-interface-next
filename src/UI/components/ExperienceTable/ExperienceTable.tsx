import { useEffect, useState } from "react";

// Components
import Button from "@/UI/components/Button/Button";
import Sort from "@/UI/components/Icons/Sort";
import Flex from "@/UI/layouts/Flex/Flex";
import Pagination from "@/UI/components/Pagination/Pagination";
import Panel from "@/UI/layouts/Panel/Panel";
import Avatar from "@/UI/components/Icons/Avatar";
import Loader from "@/UI/components/Loader/Loader";

// Constants
import {
  EXPERIENCE_TABLE_LEADERBOARD_HEADERS,
  experienceTableLeaderboardEnums,
  ExperienceTableProps,
  getCupIcon,
} from "@/UI/constants/badges";

// Utils
import { formatNumber, getTruncateEthAddress, handlePointsError } from "@/UI/utils/Points";

// Services
import { getLeaderboard } from "@/UI/services/PointsAPI";

// Styles
import styles from "./ExperienceTable.module.scss";
import ProfileImage from "@/UI/components/ProfileImage/ProfileImage";
import { LeaderboardUser } from "@/types/Stats";
import { getUserDisplayName } from "@/utils/user";
import { useAccount } from "wagmi";

const ExperienceTable = ({ page, setPage, sortConfig, setSortConfig, pageLimit, showToast }: ExperienceTableProps) => {
  const { address } = useAccount();
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [totalDataCount, setTotalDataCount] = useState<number>(0);
  const sortableColumns = [experienceTableLeaderboardEnums.RANKING];

  useEffect(() => {
    getLeaderboard({
      page,
      pageSize: pageLimit,
      sortType: sortConfig,
    }).then(({ data, error }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
      } else if (data) {
        setData(data.leaderboard);
        setTotalDataCount(data.totalEntries);
      }
    });
  }, [page, pageLimit, showToast, sortConfig]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSort = () => {
    setSortConfig(sortConfig === "asc" ? "desc" : "asc");
  };

  return (
    <Panel className={styles.wrapper}>
      <h1>Leaderboard</h1>
      <div className={styles.table}>
        {!data.length ? (
          <div className={styles.loader}>
            <Loader type='lg' />
          </div>
        ) : (
          <>
            <div className={styles.header}>
              {EXPERIENCE_TABLE_LEADERBOARD_HEADERS.map((header, idx) => {
                const isSortable = sortableColumns.includes(header);

                return (
                  <div className={styles.cell} key={idx}>
                    {header}
                    {isSortable && (
                      <Button title='Click to sort column' className={styles.sort} onClick={handleSort}>
                        <Sort />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            {data.map(({ id, ranking, displayName, walletAddress, avatarUrl, isAvatar, claimablePoints }) => (
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
                  {getUserDisplayName(displayName, walletAddress, address)}
                </div>
                <div className={styles.cell}>{formatNumber(claimablePoints, 3)}</div>
              </div>
            ))}
            {totalDataCount > pageLimit ? (
              <div className={styles.paginationContainer}>
                <Flex direction='row-space-between'>
                  <div />
                  <Pagination
                    className={styles.pagination}
                    totalItems={totalDataCount}
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
  );
};

export default ExperienceTable;
