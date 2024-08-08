// Packages
import { ReactNode } from "react";

// Styles
import styles from "./Panel.module.scss";

// Types
type PanelProps = {
  margin?: string;
  children: ReactNode;
  className?: string;
};

const Panel = ({ children, margin = "m-0", className = "" }: PanelProps) => {
  return <div className={`${styles.panel} ${margin && margin} ${className}`}>{children}</div>;
};

export default Panel;
