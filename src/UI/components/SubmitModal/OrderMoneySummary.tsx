import Flex from "@/UI/layouts/Flex/Flex";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import { AuctionSubmission } from "@/pages/trading/position-builder";
import LogoEth from "../Icons/LogoEth";
import LogoUsdc from "../Icons/LogoUsdc";

import { useUserBalance } from "@/UI/hooks/useUserBalance";
import { OrderSummaryType } from "@/types/orderSummary";
import CurrencyDisplay from "../CurrencyDisplay/CurrencyDisplay";
import styles from "./SubmitModal.module.scss";

type OrderMoneySummaryProps = {
  auctionSubmission?: AuctionSubmission;
  orderSummary?: OrderSummaryType;
};

const OrderMoneySummary = ({ auctionSubmission, orderSummary }: OrderMoneySummaryProps) => {
  const { collateralSummary } = useUserBalance();
  const collatarelETH = (orderSummary?.orderLock?.underlierAmount || 0) - collateralSummary["WETH"].orderValue;
  const collatarelUSDC = (orderSummary?.orderLock?.numeraireAmount || 0) - collateralSummary["USDC"].orderValue;
  return (
    <>
      <Flex margin='mb-16'>
        <h5 className='flexGrow'>Order Limit</h5>
        <div className={styles.valueWrapper}>
          <span className={styles.amountLabel}>
            {formatNumberByCurrency(Math.abs(Number(auctionSubmission?.order.totalNetPrice)) || 0, "string", "USDC") ||
              "-"}
          </span>
          <LogoUsdc />
          <span className={styles.currencyLabel}>USDC</span>
        </div>
      </Flex>
      <Flex margin='mb-16'>
        <h5 className='flexGrow'>Collateral Requirement</h5>
        <div>
          <div className={styles.valueWrapper}>
            <CurrencyDisplay
              amount={formatNumberByCurrency(Math.max(Number(collatarelETH), 0), "string", "WETH")}
              symbol={<LogoEth />}
              currency='WETH'
            />
          </div>
          <div className={styles.valueWrapper}>
            <CurrencyDisplay
              amount={formatNumberByCurrency(Math.max(Number(collatarelUSDC), 0), "string", "USDC")}
              symbol={<LogoUsdc />}
              currency='USDC'
            />
          </div>
        </div>
      </Flex>
      <Flex margin='mb-16'>
        <h5 className='flexGrow'>Platform Fee</h5>
        <div className={styles.valueWrapper}>
          <span className={styles.amountLabel}>
            {orderSummary?.orderFees
              ? formatNumberByCurrency(Number(orderSummary.orderFees.numeraireAmount), "string", "USDC")
              : "-"}
          </span>
          <LogoUsdc />
          <span className={styles.currencyLabel}>USDC</span>
        </div>
      </Flex>
      <div className={styles.divider} />
      <Flex margin='mb-16'>
        <h5 className='flexGrow color-white'>Total Premium</h5>
        <div className={styles.valueWrapper}>
          <span className={styles.amountLabel}>
            {orderSummary?.orderFees
              ? formatNumberByCurrency(
                  Math.abs(
                    Number(auctionSubmission?.order.totalNetPrice) + Number(orderSummary.orderFees.numeraireAmount)
                  ) || 0,
                  "string",
                  "USDC"
                ) || "-"
              : "-"}
          </span>
          <LogoUsdc />
          <span className={styles.currencyLabel}>USDC</span>
        </div>
      </Flex>
    </>
  );
};

export default OrderMoneySummary;
