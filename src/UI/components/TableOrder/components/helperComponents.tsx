// Components
import Button from "@/UI/components/Button/Button";
import Filter from "@/UI/components/Icons/Filter";

// Styles
import styles from "../TableOrder.module.scss";

interface ShowFilterButtonProps {
  fill: boolean;
  onClick: () => void;
}

interface ClearFiltersProps {
  className: string;
  onClick: () => void;
}

export const ShowFilterButton = ({ fill, onClick }: ShowFilterButtonProps) => {
  return (
    <Button title='Click to view filter options' className={styles.filter} onClick={onClick}>
      <Filter fill={fill} />
    </Button>
  );
};

export const ClearFilters = (props: ClearFiltersProps) => {
  const { className, onClick } = props;
  return (
    <Button title='Click to clear filter options' className={`${styles.clearAll} ${className}`} onClick={onClick}>
      Clear All
    </Button>
  );
};
