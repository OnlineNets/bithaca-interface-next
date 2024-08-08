// Components
import Tab from "./Tab";

// Styles
import styles from "./TabCard.module.scss";

// Types
import { MainTab } from "./TabCard";
type TabCardDesktopProps = {
  tabs: MainTab[];
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  tabClassName?: string;
};

const TabCardDesktop = ({ tabs, activeTab, setActiveTab, tabClassName }: TabCardDesktopProps) => (
  <div className={styles.leftPanel}>
    {tabs.map(tab => (
      <Tab
        key={tab.id}
        tab={tab}
        isActive={activeTab.id === tab.id}
        onClick={() => setActiveTab(tab)}
        tabClassName={tabClassName}
      />
    ))}
  </div>
);

export default TabCardDesktop;
