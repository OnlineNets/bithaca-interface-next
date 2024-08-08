// Packages
import { forwardRef } from "react";

// Components
import Rewards from "@/UI/components/Icons/Rewards";

// Styles
import styles from "./RewardsDropdown.module.scss";

// Types
type RewardsDropdownProps = {
  value: number;
};

const RewardsDropdown = forwardRef<HTMLDivElement, RewardsDropdownProps>(({ value }, ref) => {
  return (
    <div ref={ref} className={styles.container}>
      <div>
        <Rewards /> Rewards Earned
      </div>
      <p>
        {value} <span>pts</span>
      </p>
    </div>
  );
});

RewardsDropdown.displayName = "RewardsDropdown";

export default RewardsDropdown;
