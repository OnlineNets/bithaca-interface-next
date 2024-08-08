import { MainTab } from "../components/TabCard/TabCard";

export const DESCRIPTION_OPTIONS = {
  "Twin Win":
    "Pay a premium to be long the underlying while becoming short the underlying up to a barrier below the strike.",
  Bonus: "Pay a premium to be long the underlying while protecting downside up to a barrier below the strike.",
  "Risky Earn": "Define an asset price target.\nEarn risky yield on your capital at risk.",
  "Riskless Earn": "Earn yield on your collateralized loan \n( no margin liquidation risk ).",
  UP_IN: (
    <>
      <div className='fs-xs-semibold'>
        Up-and-In Call Option: <span className='italic'>The Sniper</span>
      </div>
      <div>
        Cheapen right to buy, which springs to life when asset price rises past a barrier; like a sniper waiting for
        just the right market climb to take its shot.
      </div>
    </>
  ),
  UP_OUT: (
    <>
      <div className='fs-xs-semibold'>
        Up-and-Out Call Option: <span className='italic'>The Highwire Act</span>
      </div>
      <div>
        Cheapen Right to buy when a modest rise expected but not a leap, walking a fine line between profit and
        knockout.
      </div>
    </>
  ),
  DOWN_IN: (
    <>
      <div className='fs-xs-semibold nowrap'>
        Down-and-In Put Option:<span className='italic'>Guardian Angel Depth Charge</span>
      </div>
      <div>
        Cheapen downside protection by activating right to sell when market sinks below a certain level and detonating
        like a finely calibrated depth charge acting as a guardian angel; stepping in when the market falls too much.
      </div>
    </>
  ),
  DOWN_OUT: (
    <>
      <div className='fs-xs-semibold'>
        Down-and-Out Put Option: <span className='italic'>The Bungee Jumper</span>
      </div>
      <div>
        Cheapen downside protection, risking Knock-out if the prices plunges past the barrier: ideal for a modest
        downdraft, not a rout.
      </div>
    </>
  ),
};

export const TITLE_OPTIONS = {
  "Risky Earn": (
    <>
      <span className='color-white'>Risky Earn</span> | <span className='color-white-60'>Riskless Earn</span>
    </>
  ),
  "Riskless Earn": (
    <>
      <span className='color-white-60'>Risky Earn</span> | <span className='color-white'>Riskless Earn</span>
    </>
  ),
  Bonus: (
    <>
      <span className='color-white'>Bonus</span> | <span className='color-white-60'>Twin Win</span>
    </>
  ),
  "Twin Win": (
    <>
      <span className='color-white-60'>Bonus</span> | <span className='color-white'>Twin Win</span>
    </>
  ),
};

export const TRADING_MARKET_TABS: MainTab[] = [
  {
    id: "options",
    title: "Options",
    selectedTitle: "Option",
    description:
      "A Call Option is a contract providing the user with the right to buy an asset at a fixed price at contract expiry, while a Put Option provides the user with the equivalent right to sell.",
    contentId: "optionsChart",
  },
  {
    id: "digital-options",
    title: "Digital Options",
    selectedTitle: "Digital Option",
    description:
      "A Digital Call Option pays off if underlying asset price ends up above the strike at expiry, while a Digital Put Option pays off if underlying asset price ends up below the strike at expiry. Bet on whether the market will finish above or below the strike and get paid accordingly.",
    contentId: "digitalOptionsChart",
  },
  {
    id: "forwards",
    title: "Forwards",
    selectedTitle: "Forward",
    description:
      "A Forward is a contract where the user agrees to buy or sell an asset at a fixed price and date in the future.\nGain or loss depends on the difference between the agreed price and the market price at expiry.",
    contentId: "forwardsChart",
  },
];

export const TRADING_STORIES_TABS: MainTab[] = [
  {
    id: "bet",
    title: "Bet",
    description:
      "Place a Bet on whether an asset price ends up at expiry date inside or outside a user defined range and get paid accordingly.",
    contentId: "betChart",
  },
  {
    id: "earn",
    title: TITLE_OPTIONS["Risky Earn"],
    description: DESCRIPTION_OPTIONS["Risky Earn"],
    contentId: "earnChart",
    radioOptions: [
      {
        option: "Risky Earn",
        value: "Risky Earn",
      },
      {
        option: "Riskless Earn",
        value: "Riskless Earn",
      },
    ],
    underText: [
      {
        label: "Capital At Risk",
        value: "Risky Earn",
      },
      {
        label: "Collateralized Lending",
        value: "Riskless Earn",
      },
    ],
  },
  {
    id: "noGainNoPayin",
    title: "No Gain, No Payin’",
    description:
      "Buy an option WITHOUT spending premium with maximum downside amount to be lost if asset price ends up at the strike; if you do not get the direction right, you also get your collateral back!",
    contentId: "noGainNoPayinChart",
  },
  {
    id: "bonusTwinWin",
    title: TITLE_OPTIONS.Bonus,
    description: DESCRIPTION_OPTIONS.Bonus,
    contentId: "bonusTwinWinChart",
    radioOptions: [
      {
        option: "Bonus",
        value: "Bonus",
      },
      {
        option: "Twin-Win",
        value: "Twin Win",
      },
    ],
  },
  {
    id: "barriers",
    title: "Barriers",
    description: DESCRIPTION_OPTIONS.UP_IN,
    contentId: "barriersChart",
  },
];
