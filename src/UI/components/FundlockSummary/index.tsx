import LogoEth from "../Icons/LogoEth";
import LogoUsdc from "../Icons/LogoUsdc";
import styles from "./fundlock.module.scss";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import { Currency } from "@/utils/types";
import classNames from "classnames";
import { useUserBalance } from "../../hooks/useUserBalance";

interface FundlockValueProps {
  isAlwaysInline?: boolean;
}

const FundlockValue = ({ isAlwaysInline }: FundlockValueProps) => {
  const { collateralSummary } = useUserBalance();

  return (
    <div
      className={classNames(styles.fundlockContainer, {
        [styles.alwaysInLine]: isAlwaysInline,
      })}
    >
      <span className={styles.title}>Available Balance</span>
      <div className={styles.valueContainer}>
        <LogoUsdc />
        <span className={styles.currency}>USDC</span>
        <span className={styles.value}>
          {formatNumberByCurrency(
            Number(collateralSummary["USDC"].availableCollateral),
            "string",
            "USDC" as Currency,
            2
          )}
        </span>
        <LogoEth />
        <span className={styles.currency}>WETH</span>
        <span className={styles.value}>
          {formatNumberByCurrency(
            Number(collateralSummary["WETH"].availableCollateral),
            "string",
            "WETH" as Currency,
            2
          )}
        </span>
      </div>
    </div>
  );
};

export default FundlockValue;
