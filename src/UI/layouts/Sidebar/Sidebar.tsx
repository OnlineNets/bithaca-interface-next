// Packages
import { ReactNode } from "react";

// Styles
import styles from "./Sidebar.module.scss";
import { useDevice } from "@/UI/hooks/useDevice";

// Types
type SidebarProps = {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  orderSummary: ReactNode;
};

const Sidebar = ({ leftPanel, rightPanel, orderSummary }: SidebarProps) => {
  const device = useDevice();
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        {leftPanel}
        {device !== "desktop" && <div className={styles.rightPanel}>{rightPanel}</div>}
        {device === "desktop" && <div className={styles.orderSummary}>{orderSummary}</div>}
        {device !== "desktop" && <div className={styles.orderSummary}>{orderSummary}</div>}
      </div>
      {device === "desktop" && <div className={styles.rightPanel}>{rightPanel}</div>}
    </div>
  );
};

export default Sidebar;
