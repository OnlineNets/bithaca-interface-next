import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useMemo, useState } from "react";

// Components
import Tabs from "@/UI/components/Tabs/Tabs";
import Button from "@/UI/components/Button/Button";
import Panel from "@/UI/layouts/Panel/Panel";
import Image from "next/image";

// Constants
import { QUESTS_SORTING_TABS } from "@/UI/constants/quests";
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from "@/UI/constants/breakpoints";

// Utils
import { Badge, getBadgeImage } from "@/UI/constants/badges";
import useMediaQuery from "@/UI/hooks/useMediaQuery";

// Styles
import styles from "./Quests.module.scss";
import { GetAllBadges } from "@/UI/services/PointsAPI";

import { handlePointsError } from "@/UI/utils/Points";
import { ToastItemProp } from "@/UI/constants/toast";
import { useAppStore } from "@/UI/lib/zustand/store";
import { useAccount } from "wagmi";
import { sortBadges } from "@/utils/badges";

export type QuestsProps = {
  showToast: (newToast: ToastItemProp, position: string) => void;
};

const Quests = ({ showToast }: QuestsProps) => {
  const [tabs, setTabs] = useState(QUESTS_SORTING_TABS);
  const [activeSortTab, setActiveSortTab] = useState<string>(tabs[0].id);
  const [activeFilter, setActiveFilter] = useState<string[]>([]);

  const { userBadges, isAuthenticated } = useAppStore();
  const { isConnected } = useAccount();

  const handleSortTabChange = (tabId: string) => {
    setActiveSortTab(tabId);
  };

  const handleFilterChange = (filterId: string) => {
    const updatedFilters = activeFilter.includes(filterId)
      ? activeFilter.filter(id => id !== filterId)
      : [...activeFilter, filterId];
    setActiveFilter(updatedFilters);
  };

  const [allBadges, setAllBadges] = useState([] as Badge[]);
  const [typeFilters, setTypeFilters] = useState([] as { id: string; label: string }[]);

  useEffect(() => {
    GetAllBadges().then(({ error, data }) => {
      if (error) {
        handlePointsError({
          showToast,
          title: error.name,
          message: error.message,
        });
        return;
      }
      setAllBadges(sortBadges(data || []));
      setTypeFilters(
        Array.from(new Set(data?.map(badge => badge.badgeType.toLowerCase()))).map(type => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          id: type,
        }))
      );
    });
  }, [isConnected, isAuthenticated]);

  const completedBadges = useMemo(() => {
    return userBadges.reduce(
      (acc, userBadge) => {
        acc[userBadge.badgeId] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  }, [userBadges]);

  useEffect(() => {
    const enableCompletedTab = !!userBadges?.length;
    if (!enableCompletedTab && activeSortTab === "completed") {
      setActiveSortTab("all");
    }
    setTabs(
      tabs.map(tab => {
        if (tab.id === "completed") {
          return {
            ...tab,
            disabled: !enableCompletedTab,
          };
        }
        return tab;
      })
    );
  }, [userBadges]);

  const filteredBadges = useMemo(() => {
    let results = allBadges;
    if (activeSortTab === "completed") {
      results = userBadges.map(badge => ({ ...badge.Badge, name: (badge.data?.name || badge.Badge.name).toString() }));
    } else if (activeSortTab === "upcoming") {
      results = allBadges.filter(badge => badge.isUpcoming);
    }

    if (activeFilter.length) {
      results = results.filter(badge => activeFilter.includes(badge.badgeType.toLowerCase()));
    }

    return results;
  }, [allBadges, activeFilter, activeSortTab]);

  return (
    <div className={styles.container}>
      <h1>Quests</h1>
      <Tabs
        tabs={tabs}
        activeTab={activeSortTab}
        onChange={handleSortTabChange}
        className={styles.referralsTab}
        responsive={false}
      />
      <div className={styles.filtersContainer}>
        {typeFilters.map((filter, index) => (
          <Button
            className={!activeFilter.includes(filter.id) ? styles.disabled : ""}
            key={filter.id}
            title={filter.label}
            size='sm'
            variant={!activeFilter.includes(filter.id) ? "primary" : "secondary"}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <div className={styles.questsContainer}>
        <AutoSizer>
          {({ height, width }) => (
            <List height={height} itemCount={filteredBadges.length} itemSize={150} width={width}>
              {({ index, style }) => {
                const itemData = filteredBadges[index];
                return (
                  <div style={style}>
                    <div className={styles.badgeWrapper} key={itemData.id}>
                      <Panel className={styles.questCard}>
                        <div className={styles.questTextImage}>
                          <Image
                            className={styles.badgeImage}
                            src={getBadgeImage(itemData)}
                            alt={itemData.name}
                            width={80}
                            height={80}
                          />
                          <div className={styles.textContainer}>
                            <div className={styles.title}>{itemData.name}</div>
                            <div className={styles.description}>{itemData.description}</div>
                          </div>
                        </div>
                        {itemData.isUpcoming && <div className={styles.experience}>Coming Soon</div>}
                        {completedBadges[itemData.id] && <div className={styles.experience}>Completed</div>}
                        {!itemData.isUpcoming && !completedBadges[itemData.id] && (
                          <div className={styles.experience}>To Unlock</div>
                        )}
                      </Panel>
                    </div>
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default Quests;
