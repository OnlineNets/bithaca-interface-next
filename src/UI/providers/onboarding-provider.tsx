import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { TutorialSteps } from "../constants/tutorialsteps";
import { usePersistedAppStore } from "../lib/zustand/store";

type OnboardingContextType = {
  currentStep: TutorialSteps | undefined;
  isTutorialDisabled: boolean;
  updateStep?: (step?: TutorialSteps) => void;
  disableTutorial?: () => void;
};

export const OnboardingContext = createContext<OnboardingContextType>({
  currentStep: undefined,
  isTutorialDisabled: false,
});

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { currentTutorialStep, setCurrentTutorialStep, setTutorialDisabled, tutorialDisabled } = usePersistedAppStore();
  const [currentStep, setCurrentStep] = useState(currentTutorialStep);
  const [isTutorialDisabled, setDisabled] = useState(tutorialDisabled);

  useEffect(() => {
    setDisabled(tutorialDisabled);
  }, [tutorialDisabled]);

  const updateStep = (step: TutorialSteps | undefined) => {
    setCurrentStep(step);
    setCurrentTutorialStep(step);
  };

  const disableTutorial = () => {
    setTutorialDisabled();
    setDisabled(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        isTutorialDisabled,
        updateStep,
        disableTutorial,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
