// Packages
import { ReactNode } from "react";

// Utils
import { useLastUrlSegment } from "@/UI/hooks/useLastUrlSegment";

// Styles
import styles from "./Asset.module.scss";

// Types
type AssetProps = {
  icon: ReactNode;
  label: string;
  size?: string;
};

const Asset = ({ icon, label, size }: AssetProps) => {
  const sizeClass = size ? styles[size] : "";

  const lastSegment = useLastUrlSegment();

  return (
    <div className={`assets--${lastSegment} ${styles.asset} ${sizeClass}`.trim()}>
      {icon}
      <p className={styles.label}>{label}</p>
    </div>
  );
};

export default Asset;
