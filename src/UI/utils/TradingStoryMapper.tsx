// Packages
import React, { ReactElement } from "react";

// Components
import { Barriers, Bet, BonusTwinWin, Earn, NoGainNoPayin, TradingStoriesProps } from "@/UI/components/TradingStories";
import { DigitalOptions, Forwards, Options } from "@/UI/components/TradingMarket";

const storyMap: {
  [key: string]: {
    component: ({ showInstructions, compact }: TradingStoriesProps) => JSX.Element;
    height: {
      normal: {
        mobile: { withInstructions: number; withoutInstructions: number };
        tablet: { withInstructions: number; withoutInstructions: number };
        desktop: { withInstructions: number; withoutInstructions: number };
      };
      compact: { mobile: number; tablet: number; desktop: number };
    };
  };
} = {
  betChart: {
    component: Bet,
    height: {
      compact: { mobile: 44, tablet: 50, desktop: 56 },
      normal: {
        mobile: { withInstructions: 100, withoutInstructions: 100 },
        tablet: { withInstructions: 100, withoutInstructions: 100 },
        desktop: { withInstructions: 150, withoutInstructions: 327 },
      },
    },
  },
  earnChart: {
    component: Earn,
    height: {
      compact: { mobile: 37.75, tablet: 49, desktop: 49 },
      normal: {
        mobile: { withInstructions: 153, withoutInstructions: 153 },
        tablet: { withInstructions: 153, withoutInstructions: 153 },
        desktop: { withInstructions: 180, withoutInstructions: 310.5 },
      },
    },
  },
  noGainNoPayinChart: {
    component: NoGainNoPayin,
    height: {
      compact: { mobile: 57, tablet: 69, desktop: 75 },
      normal: {
        mobile: { withInstructions: 168, withoutInstructions: 168 },
        tablet: { withInstructions: 168, withoutInstructions: 168 },
        desktop: { withInstructions: 168, withoutInstructions: 356 },
      },
    },
  },
  bonusTwinWinChart: {
    component: BonusTwinWin,
    height: {
      compact: { mobile: 57, tablet: 69, desktop: 75 },
      normal: {
        mobile: { withInstructions: 305, withoutInstructions: 320 },
        tablet: { withInstructions: 305, withoutInstructions: 320 },
        desktop: { withInstructions: 305, withoutInstructions: 392.5 },
      },
    },
  },
  barriersChart: {
    component: Barriers,
    height: {
      compact: { mobile: 43.5, tablet: 55.5, desktop: 61.5 },
      normal: {
        mobile: { withInstructions: 238, withoutInstructions: 238 },
        tablet: { withInstructions: 238, withoutInstructions: 238 },
        desktop: { withInstructions: 238, withoutInstructions: 414.5 },
      },
    },
  },
  optionsChart: {
    component: Options,
    height: {
      compact: { mobile: 58, tablet: 64, desktop: 93 },
      normal: {
        mobile: { withInstructions: 178, withoutInstructions: 239 },
        tablet: { withInstructions: 178, withoutInstructions: 239 },
        desktop: { withInstructions: 178, withoutInstructions: 239 },
      },
    },
  },
  digitalOptionsChart: {
    component: DigitalOptions,
    height: {
      compact: { mobile: 58, tablet: 64, desktop: 93 },
      normal: {
        mobile: { withInstructions: 153, withoutInstructions: 239 },
        tablet: { withInstructions: 153, withoutInstructions: 239 },
        desktop: { withInstructions: 153, withoutInstructions: 239 },
      },
    },
  },
  forwardsChart: {
    component: Forwards,
    height: {
      compact: { mobile: 75, tablet: 84, desktop: 120 },
      normal: {
        mobile: { withInstructions: 179, withoutInstructions: 240 },
        tablet: { withInstructions: 179, withoutInstructions: 240 },
        desktop: { withInstructions: 179, withoutInstructions: 240 },
      },
    },
  },
};

export const getTradingStoryMapper = (
  contentId: string,
  showInstructions: boolean,
  compact = false,
  radioChosen?: string,
  onRadioChange?: (option: string | ReactElement, title?: ReactElement) => void,
  isDesktop = false,
  isTablet = false
) => {
  if (!storyMap[contentId]) return null;
  const { component: Component, height } = storyMap[contentId];

  let chartHeight: number;
  if (compact) {
    chartHeight = !isDesktop ? height.compact.desktop : !isTablet ? height.compact.tablet : height.compact.mobile;
  } else {
    const chartInfo = !isDesktop ? height.normal.desktop : !isTablet ? height.normal.tablet : height.normal.mobile;
    chartHeight = showInstructions ? chartInfo.withInstructions : chartInfo.withoutInstructions;
  }

  return (
    <Component
      showInstructions={showInstructions}
      compact={compact}
      radioChosen={radioChosen}
      onRadioChange={onRadioChange}
      chartHeight={chartHeight}
    />
  );
};
