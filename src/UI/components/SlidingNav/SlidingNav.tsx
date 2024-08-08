// Components
import Navigation from "@/UI/components/Navigation/Navigation";

// Styles
import styles from "./SlidingNav.module.scss";

// Types
type SlidingNavProps = {
  isActive: boolean;
  onClick: () => void;
};

const SlidingNav = ({ isActive, onClick }: SlidingNavProps) => {
  const getSlidingNavClassNames = () => `${styles.slidingNav} ${isActive && styles.isOpen}`;

  return (
    <div className={getSlidingNavClassNames()}>
      <Navigation onClick={onClick} />
    </div>
  );
};

export default SlidingNav;
