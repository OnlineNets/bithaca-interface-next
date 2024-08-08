import styles from "./position-builder.module.scss";

import PositionBuilderRow from "@/UI/components/PositionBuilderRow/PositionBuilderRow";
import { PositionBuilderStrategy } from ".";
import { ProductOption } from "./helpers";

interface SingleOptionRowProps extends Omit<ProductOption, "value"> {
  isSelected: boolean;
  handleAddStrategy: (strategy: PositionBuilderStrategy) => void;
}

const SingleOptionRow = ({ isSelected, handleAddStrategy, options, option, sizeIcon }: SingleOptionRowProps) => {
  return (
    <div className={isSelected ? `${styles.option} ${styles.option__active}` : `${styles.option}`}>
      <PositionBuilderRow sizeIcon={sizeIcon} title={option} options={options} addStrategy={handleAddStrategy} />
    </div>
  );
};

export default SingleOptionRow;
