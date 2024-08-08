import { AxiosError } from "axios";

// Constants
import { ToastItemProp } from "@/UI/constants/toast";

export type PointsUserData = {
  avatarUrl: string | null;
  createdAt: string;
  discord: boolean | null;
  displayName: string;
  email: string | null;
  id: number;
  isAvatar: boolean;
  referralCode: string;
  referredBy: string | null;
  telegram: boolean | null;
  farcaster: boolean | null;
  twitter: boolean | null;
  updatedAt: string;
  walletAddress: string;
  tierId: number;
};

export type GetUserDataType = {
  user: PointsUserData;
};

export type PointsUserDataType = {
  displayName: string;
  avatarUrl: string | null;
  isAvatar: boolean;
  signature: string;
};

export type GuildMember = {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: string | null;
  };
  nick: string | null;
  avatar: string | null;
  roles: string[];
  joined_at: string;
  deaf: boolean;
  mute: boolean;
};

export type EventsTypes = "All" | "Withdrawal" | "Earn";

export type GetRewardsProps = {
  page: number;
  pageLimit: number;
  sortField: string;
  sortType: "asc" | "desc";
  filterBy?: EventsTypes;
};

export type GetUserWalletProofProps = {
  walletAddress: string;
  points: string;
};

export type UpdateInfoAfterRedeemProps = {
  walletAddress: string;
  points: number;
  hash: string;
  tokenAmount: number;
};

export type RewardEvent = {
  id: number;
  date: string;
  type: EventsTypes;
  details: string;
  points: number;
};

export interface AggregatedUserPoints {
  tradingMode: string | null;
  type: EventsTypes;
  date: string;
  points: number;
  description: string;
}

export type GetRewardsHistory = {
  points: number;
  isPointActived: boolean;
  claimablePoints: number;
  mainnetTradingPoints: number;
  testnetTradingPoints: number;
  inactiveReferralPoints: number;
  rewards: { events: AggregatedUserPoints[]; total: number };
  user: PointsUserData;
};

export type GetUserWalletProofData = {
  proof: `0x${string}`[];
};

export type UpdateInfoAfterRedeemData = {
  isBalanceUpdated: boolean;
  isEventCreated: boolean;
};

export type ResponseType<T> = {
  data?: T;
  error?: AxiosError;
};

export type UpdateUserType = {
  data: { id: string; welcomePoints: number };
  message: string;
};

export type JoinSocialMediaType = {
  url: string;
};

export type HandlePointsErrorProps = {
  showToast: (newToast: ToastItemProp, position: string) => void;
  title: string;
  message: string;
};

export type SocialMediaStatus = {
  wallet: boolean;
  twitter: boolean;
  discord: boolean;
  telegram: boolean;
  farcaster: boolean;
};

export const DISCORD_LINK = "https://discord.gg/ithaca";

export const TWITTER_LINK = "https://twitter.com/ithacaprotocol";

export const TELEGRAM_LINK = "https://t.me/+E7KmlGwmxmtkOWU1";
