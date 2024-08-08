import { TutorialSteps } from "@/UI/constants/tutorialsteps";
import { StateCreator } from "zustand";

type TutorialData = {
  currentTutorialStep: TutorialSteps | undefined;
  tutorialDisabled: boolean;
};

const initialState: TutorialData = {
  currentTutorialStep: undefined,
  tutorialDisabled: false,
};

export interface TutorialSlice extends TutorialData {
  setCurrentTutorialStep: (step: TutorialSteps | undefined) => void;
  setTutorialDisabled: () => void;
}

export const createTutorialSlice: StateCreator<TutorialSlice> = set => ({
  ...initialState,
  setCurrentTutorialStep: step => {
    set({ currentTutorialStep: step });
  },
  setTutorialDisabled: () => {
    set({ tutorialDisabled: true });
  },
});
