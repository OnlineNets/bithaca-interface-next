// Utils
import { getTradingStoryMapper } from "@/UI/utils/TradingStoryMapper";

// Components
import Dropdown from "../Icons/Dropdown";

// Styles
import styles from "./TabCard.module.scss";

// Types
import { MainTab } from "./TabCard";
import { ReactNode, useEffect, useState } from "react";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from "@/UI/constants/breakpoints";
type TabCardMobileProps = {
  activeDropdown: boolean;
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  setActiveDropdown: (activeDropdown: boolean) => void;
  tabClassName?: string;
  openOptions: MainTab[];
};

const TabCardMobile = ({
  activeDropdown,
  setActiveDropdown,
  openOptions,
  activeTab,
  setActiveTab,
  tabClassName,
}: TabCardMobileProps) => {
  const [description, setDescription] = useState(activeTab.description);
  const [title, setTitle] = useState(activeTab.title);
  const [openDescriptions, setOpenDescriptions] = useState<Record<string, ReactNode>>({});

  const desktopBreakpoint = useMediaQuery(DESKTOP_BREAKPOINT);
  const tabletBreakpoint = useMediaQuery(TABLET_BREAKPOINT);

  useEffect(() => {
    setDescription(activeTab.description);
    setTitle(activeTab.title);
    setOpenDescriptions(
      openOptions.reduce(
        (obj: Record<string, ReactNode>, item: MainTab) => {
          obj[item.id] = item.description;
          return obj;
        },
        {} as Record<string, ReactNode>
      )
    );
  }, [openOptions, activeTab]);

  return (
    <div style={{ maxHeight: activeDropdown ? "3000px" : "119px" }} className={styles.dropDownPanel}>
      {
        <div
          className={`tab--${activeTab.id} ${styles.tab} ${tabClassName}`}
          onClick={() => setActiveDropdown(!activeDropdown)}
        >
          <div className={styles.tabInfo}>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <div className={styles.tabChart}>
            {getTradingStoryMapper(
              activeTab.contentId,
              false,
              true,
              undefined,
              (desc, changedTitle) => {
                setDescription(desc);
                if (changedTitle) {
                  setTitle(changedTitle);
                }
              },
              desktopBreakpoint,
              tabletBreakpoint
            )}
          </div>
        </div>
      }
      {openOptions.map((tab: MainTab) => (
        <div
          key={tab.id}
          className={`tab--${tab.id} ${styles.tab} ${tabClassName}`}
          onClick={() => {
            setActiveTab(tab), setActiveDropdown(false);
          }}
        >
          <div className={styles.tabInfo}>
            <h3>{tab.title}</h3>
            <p>{openDescriptions[tab.id]}</p>
          </div>
          <div className={styles.tabChart}>
            {getTradingStoryMapper(
              tab.contentId,
              false,
              true,
              undefined,
              desc => {
                setOpenDescriptions({
                  ...openDescriptions,
                  [tab.id]: desc,
                });
              },
              desktopBreakpoint,
              tabletBreakpoint
            )}
          </div>
        </div>
      ))}
      <button onClick={() => setActiveDropdown(!activeDropdown)} className={styles.openStoriesDropdown}>
        <Dropdown />
      </button>
    </div>
  );
};

export default TabCardMobile;
