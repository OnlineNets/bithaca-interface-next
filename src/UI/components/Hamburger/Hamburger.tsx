// Components
import Button from "@/UI/components/Button/Button";

// Styles
import styles from "./Hamburger.module.scss";

// Types
type HamburgerProps = {
  onClick: () => void;
  isActive: boolean;
  className?: string;
};

const Hamburger = ({ onClick, isActive, className }: HamburgerProps) => {
  const getButtonClassName = () => {
    let classes = `${styles.hamburger} ${isActive ? styles.isActive : ""}`;

    if (className) {
      classes += ` ${className}`;
    }

    return classes;
  };

  return (
    <Button className={getButtonClassName()} title='Click to open menu' onClick={onClick} variant='icon'>
      <span className={styles.box}>
        <span className={styles.inner} />
      </span>
    </Button>
  );
};

export default Hamburger;
