export type ArgonautData = {
  ranking: number;
  user: `0x${string}`;
  displayName: string;
  tradingBalance: string;
};

export type ArgonautSortConfig = {
  key: keyof ArgonautData;
  direction: "asc" | "desc";
};

export type ArgonautTableProps = {
  page: number;
  setPage: (page: number) => void;
  sortConfig: ArgonautSortConfig;
  setSortConfig: (newSortConfig: ArgonautSortConfig) => void;
  pageLimit: number;
};

export enum argonautLeaderboardTableEnums {
  RANKING = "Ranking",
  USER = "User",
  TRADING_BALANCE = "Trading Balance USD Equivalent",
}

export const ARGONAUT_LEADERBOARD_TABLE_HEADERS = Object.values(argonautLeaderboardTableEnums);

export const headerToKeyMap: Record<argonautLeaderboardTableEnums, keyof ArgonautData> = {
  Ranking: "ranking",
  User: "user",
  "Trading Balance USD Equivalent": "tradingBalance",
};
