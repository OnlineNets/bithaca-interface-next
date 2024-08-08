// Components
import Flex from "@/UI/layouts/Flex/Flex";
import Button from "@/UI/components/Button/Button";
import Sort from "@/UI/components/Icons/Sort";
import Pagination from "@/UI/components/Pagination/Pagination";

// Constants
import {
  headerToKeyMap,
  TABLE_REWARDS_LEADERBOARD_HEADERS,
  tableRewardsLeaderboardEnums,
  TableRewardsLeaderBoardProps,
} from "@/UI/constants/rewardsLeaderboard";
import { RewardEvent } from "@/UI/constants/pointsProgram";

// Utils
import { formatPoints } from "@/UI/utils/Points";

// Styles
import styles from "./TableRewardsLeaderboard.module.scss";

const TableRewardsLeaderboard = ({
  data,
  totalDataCount,
  page,
  setPage,
  sortConfig,
  setSortConfig,
  pageLimit,
}: TableRewardsLeaderBoardProps) => {
  const sortableColumns = [tableRewardsLeaderboardEnums.DATE, tableRewardsLeaderboardEnums.POINTS];

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSort = (key: keyof RewardEvent) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={styles.table}>
      <div className={styles.header}>
        {TABLE_REWARDS_LEADERBOARD_HEADERS.map((header, idx) => {
          const isSortable = sortableColumns.includes(header);
          const sortKey = headerToKeyMap[header];

          return (
            <div className={styles.cell} key={idx}>
              {header}
              {isSortable && (
                <Button title='Click to sort column' className={styles.sort} onClick={() => handleSort(sortKey)}>
                  <Sort />
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {data.map((leader, idx) => (
        <div className={styles.row} key={idx}>
          <div className={styles.cell}>{leader.date}</div>
          <div className={styles.cell}>{leader.description}</div>
          <div className={styles.cell}>
            <p className={leader.type === "Earn" ? styles.positive : ""}>{formatPoints(leader.points, leader.type)}</p>
          </div>
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
    </div>
  );
};

export default TableRewardsLeaderboard;
