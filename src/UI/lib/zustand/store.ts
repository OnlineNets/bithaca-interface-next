// store.ts

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createIthacaSDKSlice } from "./slices/ithacaSDKSlice";
import { createPointsSlice, PointsSlice } from "./slices/pointsSlice";
import { createTutorialSlice, TutorialSlice } from "./slices/tutorialSlice";
import { IthacaSDKSlice } from "./slices/types";

type StoreState = IthacaSDKSlice & PointsSlice;
type PersistedStoreState = TutorialSlice;

export const useAppStore = create<StoreState>()((...a) => ({
  ...createIthacaSDKSlice(...a),
  ...createPointsSlice(...a),
}));

export const usePersistedAppStore = create<PersistedStoreState>()((...a) => ({
  ...persist(createTutorialSlice, {
    name: "tutorial-store",
    storage: createJSONStorage(() => sessionStorage),
  })(...a),
}));
