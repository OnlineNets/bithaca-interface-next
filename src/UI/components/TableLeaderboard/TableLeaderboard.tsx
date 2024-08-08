// Packages
import { useMemo, useState } from "react";

// Constants
import { LeaderboardEntry, TABLE_LEADERBOARD_HEADERS } from "@/UI/constants/tableLeaderboard";

// Utils
import { getNumberFormat } from "@/UI/utils/Numbers";

// Layout
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import Pagination from "@/UI/components/Pagination/Pagination";
import Avatar from "@/UI/components/Icons/Avatar";
import Button from "@/UI/components/Button/Button";
import Sort from "@/UI/components/Icons/Sort";

// Styles
import styles from "./TableLeaderboard.module.scss";

// Types
type TableLeaderboardProps = {
  data: LeaderboardEntry[];
};

type ReferralsSortConfig = {
  key: keyof LeaderboardEntry;
  direction: "ascending" | "descending";
};

const TableLeaderboard = ({ data }: TableLeaderboardProps) => {
  const initialSortConfig: ReferralsSortConfig = {
    key: "ranking",
    direction: "ascending",
  };

  const headerToKeyMap: Record<string, keyof LeaderboardEntry> = {
    Ranking: "ranking",
    "24H Points": "points",
    "Total Points": "totalPoints",
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<ReferralsSortConfig | null>(initialSortConfig);

  const pageLimit = 9;

  // Handle page change in pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Sort the data
  const sortableColumns = ["Ranking", "24H Points", "Total Points"];

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Handle sorting
  const requestSort = (key: keyof LeaderboardEntry) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={styles.table}>
      <div className={styles.header}>
        {TABLE_LEADERBOARD_HEADERS.map((header, idx) => {
          const isSortable = sortableColumns.includes(header);
          const sortKey = headerToKeyMap[header];

          return (
            <div className={styles.cell} key={idx}>
              {header}
              {isSortable && (
                <Button title='Click to sort column' className={styles.sort} onClick={() => requestSort(sortKey)}>
                  <Sort />
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {sortedData.length ? (
        sortedData.map((leader, idx) => (
          <div className={styles.row} key={idx}>
            <div className={styles.cell}>{leader.ranking}</div>
            <div className={styles.cell}>
              <Avatar />
              {leader.user}
            </div>
            <div className={styles.cell}>{getNumberFormat(leader.points)}</div>
            <div className={styles.cell}>{getNumberFormat(leader.totalPoints)}</div>
          </div>
        ))
      ) : (
        <div className={styles.emptyContainer}>
          <div className={styles.row}>No results found</div>
        </div>
      )}
      {sortedData.length > 9 ? (
        <Flex direction='row-space-between' margin='mt-35 mt-tablet-16'>
          <div />
          <Pagination
            totalItems={data.length}
            itemsPerPage={pageLimit}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </Flex>
      ) : null}
    </div>
  );
};

export default TableLeaderboard;
