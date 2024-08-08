// Packages
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// Constants
import { NAVIGATION_ITEMS } from "@/UI/constants/navigation";

// Components
import ChevronDown from "@/UI/components/Icons/ChevronDown";

// Services
import mixPanel from "@/services/mixpanel";

// Lib
import { useAppStore } from "@/UI/lib/zustand/store";

// Styles
import styles from "./Navigation.module.scss";

// Types
type NavigationProps = {
  onClick?: () => void;
};

const Navigation = ({ onClick }: NavigationProps) => {
  const router = useRouter();
  const [totalOpenOrders, setTotalOpenOrders] = useState<number>(0);
  const { ithacaSDK, isAuthenticated, openOrdersCount } = useAppStore();

  const checkIsActivePath = (path: string) => {
    if (path === "#") return false;
    return path === "/" ? router.pathname === path : router.pathname.includes(path.split("/")[1]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      ithacaSDK.orders.clientOpenOrders().then(res => setTotalOpenOrders(res.length));
    } else {
      setTotalOpenOrders(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => setTotalOpenOrders(openOrdersCount), [openOrdersCount]);

  const handleClick = (disabled: boolean | undefined, path: string) => {
    if (!disabled && path !== "#") {
      // POINTS_EVENTS: Menu interactions - service connected
      mixPanel.track("Menu interactions", { path });
      if (onClick) onClick();
    }
  };

  return (
    <nav className={styles.nav}>
      {NAVIGATION_ITEMS.map(({ titleKey, disabled, path, displayText }) => (
        <Link
          key={titleKey}
          href={!disabled ? path : router.pathname}
          className={checkIsActivePath(path) ? styles.isActive : disabled ? styles.disabled : ""}
          title={titleKey}
          onClick={() => handleClick(disabled, path)}
        >
          {displayText}
          {displayText === "More" && <ChevronDown />}
          {displayText === "Dashboard" && totalOpenOrders > 0 && (
            <span className={styles.badge}>{totalOpenOrders}</span>
          )}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
