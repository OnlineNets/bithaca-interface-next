export type GetLeaderboardParams = {
  page: number;
  pageSize: number;
  sortType: "asc" | "desc";
};

export type LeaderboardUser = {
  id: string;
  walletAddress: `0x${string}`;
  displayName: string;
  isAvatar: boolean;
  avatarUrl: string | null;
  claimablePoints: number;
  ranking: number;
};

export type LeaderboardUser24Hr = {
  id: string;
  walletAddress: `0x${string}`;
  displayName: string;
  isAvatar: boolean;
  avatarUrl: string | null;
  mainnetTradingPoints: number;
  ranking: number;
  badgeName: string | null;
  badgeImageUrl: string | null;
  badgeRewards: number | null;
};

export type GetLeaderboardResponse<T> = {
  leaderboard: T[];
  totalEntries: number;
  currentPage: number;
  totalPages: number;
};

export type Stats24Hr = {
  mainnetTradingPoints: number;
  ranking: number;
  badgeName: string | null;
  badgeImageUrl: string | null;
  badgeRewards: number | null;
};

export type UserStats = {
  id: string;
  walletAddress: `0x${string}`;
  displayName: string;
  isAvatar: boolean;
  avatarUrl: string | null;
  acceptedInvites: number;
  points: number;
  testnetTradingPoints: number;
  mainnetTradingPoints: number;
  claimablePoints: number;
  redeemedPoints: number;
  inactiveReferralPoints: number;
  isPointActived: boolean;
};

export type GetUserStatsResponse = UserStats & {
  ranking: number;
  stats24hr: Stats24Hr | null;
};
