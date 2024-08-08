// Types
export type NavigationItems = {
  path: string;
  titleKey: string;
  displayText: string;
  disabled?: boolean;
  children?: NavigationItems[];
};

export const NAVIGATION_ITEMS: NavigationItems[] = [
  {
    path: "/trading/dynamic-option-strategies",
    titleKey: "Click to visit trading",
    displayText: "Trading",
  },
  {
    path: "/pricing",
    titleKey: "Click to visit pricing",
    displayText: "Pricing",
  },
  {
    path: "/dashboard",
    titleKey: "Click to visit dashboard",
    displayText: "Dashboard",
  },
  {
    path: "/analytics",
    titleKey: "Click to visit analytics",
    displayText: "Analytics",
  },
  {
    path: "/points/season-one",
    titleKey: "Click to visit points program",
    displayText: "Airdrop",
  },
];
