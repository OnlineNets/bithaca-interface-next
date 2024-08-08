// Components
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

// Styles
import styles from "./CollateralAmount.module.scss";
import { Currency } from "@/utils/types";
import { Fragment } from "react";

// Types
type CollateralAmountProps = {
  wethAmount: number;
  usdcAmount: number;
};

type SingleCurrencyAmountProps = {
  amount: number;
  currency: Currency;
};

export const SingleCurrencyAmount = ({ amount, currency }: SingleCurrencyAmountProps) => {
  return (
    <div className={styles.container}>
      <span className={styles.amount}>{amount}</span>
      <div>
        {currency === "USDC" && <LogoUsdc />}
        {currency === "WETH" && <LogoEth />}
      </div>
      <span className={styles.currency}>{currency}</span>
    </div>
  );
};
const CollateralAmount = ({ wethAmount, usdcAmount }: CollateralAmountProps) => {
  const amounts = [
    { amount: wethAmount, Logo: LogoEth, currency: "WETH" },
    { amount: usdcAmount, Logo: LogoUsdc, currency: "USDC" },
  ];

  return (
    <div className={styles.container}>
      {amounts.map(({ amount, Logo, currency }) => (
        <Fragment key={currency}>
          <span className={styles.amount}>{amount}</span>
          <div>
            <Logo />
          </div>
          <span className={styles.currency}>{currency}</span>
        </Fragment>
      ))}
    </div>
  );
};

export default CollateralAmount;
