// Components
import Avatar from "@/UI/components/Icons/Avatar";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Utils
import { getNumberFormat } from "@/UI/utils/Numbers";

// Types
import { CardProps } from "@/UI/constants/card";

// Styles
import styles from "./Card.module.scss";

const Card = ({ title, address, label, value, icon, currency }: CardProps) => {
  const isProfitableOrEfficientCard = title === "The Most Profitable" || title === "The Most Efficient";
  const formattedValue = (value >= 0 ? "+" : "-") + getNumberFormat(value);
  const isEfficientCard = title === "The Most Efficient";
  const valueColor = value >= 0 ? styles.colorGreen : styles.colorRed;

  return (
    <div className={styles.container}>
      <p>{title}</p>
      <div className={styles.address}>
        <Avatar />
        <p>{address}</p>
      </div>
      <div className={styles.data}>
        <p>{label}</p>
        <Flex gap='gap-5' direction='row-center'>
          {isProfitableOrEfficientCard ? (
            <span className={`${styles.value} ${valueColor}`}>
              {formattedValue}
              {isEfficientCard && "%"}
            </span>
          ) : (
            <span className={styles.value}>{getNumberFormat(value)}</span>
          )}
          {icon && icon}
          <span>{currency && currency}</span>
        </Flex>
      </div>
    </div>
  );
};

export default Card;
