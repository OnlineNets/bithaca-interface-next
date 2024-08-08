// Packages
import { ReactNode } from "react";

// Styles
import styles from "./CurrencyDisplay.module.scss";
import classNames from "classnames";

// Types
type CurrencyDisplayProps = {
  amount: number | string;
  symbol: ReactNode;
  currency: string;
  size?: string;
  className?: string;
};

const CurrencyDisplay = ({ amount, symbol, currency, size, className }: CurrencyDisplayProps) => {
  const sizeClass = size ? styles[size] : "";

  return (
    <div className={classNames(styles.container, sizeClass, className)}>
      {amount} {symbol} <span>{currency}</span>
    </div>
  );
};

export default CurrencyDisplay;
