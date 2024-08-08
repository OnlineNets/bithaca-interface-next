import { AggregatedUserPoints, RewardEvent } from "@/UI/constants/pointsProgram";

export type TableRewardsLeaderBoardProps = {
  data: AggregatedUserPoints[];
  totalDataCount: number;
  page: number;
  setPage: (page: number) => void;
  sortConfig: RewardsSortConfig;
  setSortConfig: (newSortConfig: RewardsSortConfig) => void;
  pageLimit: number;
};

export enum tableRewardsLeaderboardEnums {
  DATE = "Date",
  DETAILS = "Details",
  POINTS = "Points",
}

export const TABLE_REWARDS_LEADERBOARD_HEADERS = Object.values(tableRewardsLeaderboardEnums);

export type RewardsSortConfig = {
  key: keyof RewardEvent;
  direction: "asc" | "desc";
};

export const headerToKeyMap: Record<tableRewardsLeaderboardEnums, keyof RewardEvent> = {
  Date: "date",
  Details: "details",
  Points: "points",
};
