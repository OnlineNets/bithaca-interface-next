export const TABLE_LEADERBOARD_HEADERS: string[] = ["Ranking", "User", "24H Points", "Total Points"];

export type LeaderboardEntry = {
  ranking: number;
  user: string;
  points: string;
  totalPoints: string;
};

export const TABLE_LEADERBOARD_DATA: LeaderboardEntry[] = [
  { ranking: 1, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 2, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 3, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 4, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 5, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 6, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 7, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 8, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 9, user: "0x4c31...c0ed", points: "32000", totalPoints: "184200" },
  { ranking: 24, user: "You", points: "32000", totalPoints: "184200" },
];
