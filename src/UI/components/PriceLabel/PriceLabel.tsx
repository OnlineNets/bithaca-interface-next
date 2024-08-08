// Packages
import { ReactNode } from "react";

// Styles
import styles from "./PriceLabel.module.scss";

// Types
type PriceLabelProps = {
  label: number | string;
  icon: ReactNode;
  className?: string;
};

const PriceLabel = ({ label, icon, className }: PriceLabelProps) => {
  const classes = `${styles.container} ${className || ""}`.trim();

  return (
    <div className={classes}>
      <div className={styles.label}>{label}</div>
      {icon}
    </div>
  );
};

export default PriceLabel;
