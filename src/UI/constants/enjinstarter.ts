export type EnjinstarterData = {
  ranking: number;
  user: `0x${string}`;
  displayName: string;
  tradingBalance: string;
  percentageGain: string;
};

export type EnjinstarterSortConfig = {
  key: keyof EnjinstarterData;
  direction: "asc" | "desc";
};

export type EnjinstarterTableProps = {
  page: number;
  setPage: (page: number) => void;
  sortConfig: EnjinstarterSortConfig;
  setSortConfig: (newSortConfig: EnjinstarterSortConfig) => void;
  pageLimit: number;
};

export enum enjinstarterLeaderboardTableEnums {
  RANKING = "Ranking",
  USER = "User",
  PercentageGain = "Percentage Gain",
  TRADING_BALANCE = "Trading Balance USD Equivalent",
}

export const ENJINSTARTER_LEADERBOARD_TABLE_HEADERS = Object.values(enjinstarterLeaderboardTableEnums);

export const headerToKeyMap: Record<enjinstarterLeaderboardTableEnums, keyof EnjinstarterData> = {
  Ranking: "ranking",
  User: "user",
  "Percentage Gain": "percentageGain",
  "Trading Balance USD Equivalent": "tradingBalance",
};
