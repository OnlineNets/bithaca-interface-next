// Tiers Images
import FirstTier from "@/assets/tiers/FirstTier-min.png";
import SecondTier from "@/assets/tiers/SecondTier-min.png";
import ThirdTier from "@/assets/tiers/ThirdTier-min.png";
import FourthTier from "@/assets/tiers/FourthTier-min.png";
import FifthTier from "@/assets/tiers/FifthTier-min.png";
import SixthTier from "@/assets/tiers/SixthTier-min.png";
import SeventhTier from "@/assets/tiers/SeventhTier-min.png";
import EighthTier from "@/assets/tiers/EighthTier-min.png";
import NinthTier from "@/assets/tiers/NinthTier-min.png";
import TenthTier from "@/assets/tiers/TenthTier-min.png";
import EleventhTier from "@/assets/tiers/EleventhTier-min.png";

// Badges Images
import Level1Badge from "@/assets/badges/level-1.png";
import Level2Badge from "@/assets/badges/level-2.png";
import Level3Badge from "@/assets/badges/level-3.png";
import Level4Badge from "@/assets/badges/level-4.png";
import Level5Badge from "@/assets/badges/level-5.png";
import TraderBadge from "@/assets/badges/22.png";
import OGBadge from "@/assets/badges/33.png";
import DefaultBadge from "@/assets/badges/default.png";

// Streaks Images
import DayOne from "@/assets/streaks/day_1-min.png";
import DayTwo from "@/assets/streaks/day_2-min.png";
import DayThree from "@/assets/streaks/day_3-min.png";
import DayFour from "@/assets/streaks/day_4-min.png";
import DayFive from "@/assets/streaks/day_5-min.png";
import DaySix from "@/assets/streaks/day_6-min.png";
import DaySeven from "@/assets/streaks/day_7-min.png";
import WeekOne from "@/assets/streaks/week_1-min.png";
import WeekTwo from "@/assets/streaks/week_2-min.png";
import WeekThree from "@/assets/streaks/week_3-min.png";
import WeekFour from "@/assets/streaks/week_4-min.png";
import MonthOne from "@/assets/streaks/month_1-min.png";
import MonthTwo from "@/assets/streaks/month_2-min.png";
import MonthThree from "@/assets/streaks/month_3-min.png";
import MonthFour from "@/assets/streaks/month_4-min.png";
import MonthFive from "@/assets/streaks/month_5-min.png";
import MonthSix from "@/assets/streaks/month_6-min.png";
import MonthSeven from "@/assets/streaks/month_7-min.png";
import MonthEight from "@/assets/streaks/month_8-min.png";
import MonthNine from "@/assets/streaks/month_9-min.png";
import MonthTen from "@/assets/streaks/month_10-min.png";
import MonthEleven from "@/assets/streaks/month_11-min.png";
import MonthTwelfth from "@/assets/streaks/month_12-min.png";
import YearOne from "@/assets/streaks/year_1-min.png";
import YearTwo from "@/assets/streaks/year_2-min.png";
import YearThree from "@/assets/streaks/year_3-min.png";
import YearFour from "@/assets/streaks/year_4-min.png";
import YearFive from "@/assets/streaks/year_5-min.png";

// Leaderboard Icons
import BronzeCup from "@/UI/components/Icons/BronzeCup";
import GoldenCup from "@/UI/components/Icons/GoldCup";
import SilverCup from "@/UI/components/Icons/SilverCup";
import { PointsUserData } from "@/UI/constants/pointsProgram";
import { ToastItemProp } from "@/UI/constants/toast";
import { StaticImageData } from "next/image";

const badgesImageMap: Record<string, StaticImageData> = {
  "referral-quest-lv1": Level1Badge,
  "referral-quest-lv2": Level2Badge,
  "referral-quest-lv3": Level3Badge,
  "referral-quest-lv4": Level4Badge,
  "referral-quest-lv5": Level5Badge,
  "og-trade": OGBadge,
  "first-trade-execution": TraderBadge,
};

export const getBadgeImage = (badge: Badge) => {
  if (badgesImageMap[badge.slug]) {
    return badgesImageMap[badge.slug];
  }

  if (badge.imageUrl) {
    return `/images/badges/${badge.imageUrl}`;
  }

  return DefaultBadge;
};

const tierImages = [
  FirstTier,
  SecondTier,
  ThirdTier,
  FourthTier,
  FifthTier,
  SixthTier,
  SeventhTier,
  EighthTier,
  NinthTier,
  TenthTier,
  EleventhTier,
];

export const getTierImage = (level: number) => {
  return tierImages[level - 1];
};

export const getStreakImage = (streakISODate: string) => {
  const currentDate = new Date();
  const streakDate = new Date(streakISODate);

  const timeDifferenceInMilliseconds = currentDate.getTime() - streakDate.getTime();
  const timeDifferenceInDays = Math.ceil(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));

  if (timeDifferenceInDays <= 1) {
    return DayOne;
  } else if (timeDifferenceInDays <= 2) {
    return DayTwo;
  } else if (timeDifferenceInDays <= 3) {
    return DayThree;
  } else if (timeDifferenceInDays <= 4) {
    return DayFour;
  } else if (timeDifferenceInDays <= 5) {
    return DayFive;
  } else if (timeDifferenceInDays <= 6) {
    return DaySix;
  } else if (timeDifferenceInDays === 7) {
    return DaySeven;
  } else if (timeDifferenceInDays <= 7) {
    return WeekOne;
  } else if (timeDifferenceInDays <= 7 * 2) {
    return WeekTwo;
  } else if (timeDifferenceInDays <= 7 * 3) {
    return WeekThree;
  } else if (timeDifferenceInDays <= 7 * 4) {
    return WeekFour;
  } else if (timeDifferenceInDays <= 30) {
    return MonthOne;
  } else if (timeDifferenceInDays <= 30 * 2) {
    return MonthTwo;
  } else if (timeDifferenceInDays <= 30 * 3) {
    return MonthThree;
  } else if (timeDifferenceInDays <= 30 * 4) {
    return MonthFour;
  } else if (timeDifferenceInDays <= 30 * 5) {
    return MonthFive;
  } else if (timeDifferenceInDays <= 30 * 6) {
    return MonthSix;
  } else if (timeDifferenceInDays <= 30 * 7) {
    return MonthSeven;
  } else if (timeDifferenceInDays <= 30 * 8) {
    return MonthEight;
  } else if (timeDifferenceInDays <= 30 * 9) {
    return MonthNine;
  } else if (timeDifferenceInDays <= 30 * 10) {
    return MonthTen;
  } else if (timeDifferenceInDays <= 30 * 11) {
    return MonthEleven;
  } else if (timeDifferenceInDays <= 30 * 12) {
    return MonthTwelfth;
  } else if (timeDifferenceInDays <= 365) {
    return YearOne;
  } else if (timeDifferenceInDays <= 365 * 2) {
    return YearTwo;
  } else if (timeDifferenceInDays <= 365 * 3) {
    return YearThree;
  } else if (timeDifferenceInDays <= 365 * 4) {
    return YearFour;
  } else {
    return YearFive;
  }
};

export const getStreakLabel = (streakISODate: string) => {
  const currentDate = new Date();
  const streakDate = new Date(streakISODate);

  const timeDifferenceInMilliseconds = currentDate.getTime() - streakDate.getTime();
  const timeDifferenceInDays = Math.ceil(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));

  if (timeDifferenceInDays <= 7) {
    return "Daily";
  } else if (timeDifferenceInDays <= 7 * 4) {
    return "Weekly";
  } else if (timeDifferenceInDays <= 30 * 12) {
    return "Monthly";
  } else {
    return "Yearly";
  }
};

export type ExperienceData = {
  acceptedInvites: number;
  avatarUrl: string | null;
  displayName: string;
  id: string;
  invitedBy: string;
  isAvatar: boolean;
  points: number;
  ranking: number;
};

export type ExperienceTableProps = {
  page: number;
  setPage: (page: number) => void;
  sortConfig: "asc" | "desc";
  setSortConfig: (newSortConfig: "asc" | "desc") => void;
  pageLimit: number;
  showToast: (newToast: ToastItemProp, position: string) => void;
};

export enum experienceTableLeaderboardEnums {
  RANKING = "Ranking",
  DISPLAY_NAME = "User",
  POINTS = "Points",
}

export const EXPERIENCE_TABLE_LEADERBOARD_HEADERS = Object.values(experienceTableLeaderboardEnums);

export const getCupIcon = (ranking: number) => {
  switch (ranking) {
    case 1:
      return <GoldenCup />;
    case 2:
      return <SilverCup />;
    case 3:
      return <BronzeCup />;
  }
};

export type GetBadgesLeaderboardDataProps = {
  page: number;
  pageLimit: number;
  sortField: string;
  sortType: "asc" | "desc";
};

export type GetBadgesProfileData = {
  user: PointsUserData;
  points: number;
  claimablePoints: number;
  inactiveReferralPoints: number;
  tiers: TierData;
  userBadges: UserBadge[];
};

export type GetBadgesLeaderboardDataResponse = {
  leaderboard: {
    total: number;
    users: ExperienceData[];
  };
};

export type TierData = {
  description: string;
  icon: string | null;
  id: number;
  maxPoints: number;
  minPoints: number;
  name: string;
};

export type Badge = {
  id: number;
  name: string;
  description: string;
  slug: string;
  group: string;
  type: number;
  defaultRewards: number;
  badgeType: string;
  imageUrl: string;
  criteria: Record<string, string | number | boolean>;
  isUpcoming?: boolean;
};

export type UserBadge = {
  id: number;
  badgeId: number;
  awardedAt: string;
  Badge: Badge;
  data?: Record<string, string | number | boolean>;
};

export type PointsProfileProps = {
  showToast: (newToast: ToastItemProp, position: string) => void;
};

export const INITIAL_TIER_DATA: TierData = {
  description: "",
  icon: null,
  id: 1,
  maxPoints: 999,
  minPoints: 0,
  name: "-",
};
