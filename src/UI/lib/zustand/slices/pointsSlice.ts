import { UserBadge } from "@/UI/constants/badges";
import { StateCreator } from "zustand";

type ProfileData = {
  displayName: string;
  avatarUrl: string;
  isAvatar: boolean;
  referralCode: string;
  userBadges: UserBadge[];
};

const initialState: ProfileData = {
  displayName: "",
  avatarUrl: "",
  isAvatar: true,
  referralCode: "",
  userBadges: [],
};

export interface PointsSlice extends ProfileData {
  setUserBadges: (badges: UserBadge[]) => void;
  setUserPointsData: (someState: Partial<ProfileData>) => void;
  resetState: () => void;
}

export const createPointsSlice: StateCreator<PointsSlice> = set => ({
  ...initialState,
  setUserBadges: userBadges => {
    set({ userBadges });
  },
  setUserPointsData: someState => {
    set({ ...someState });
  },
  resetState: () => {
    set(initialState);
  },
});
