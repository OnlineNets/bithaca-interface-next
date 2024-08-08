// Components
import CollateralAmount from "@/UI/components/CollateralAmount/CollateralAmount";

// Utils
import { formatCurrencyPair, renderDate } from "@/UI/utils/TableOrder";

// Styles
import styles from "./Summary.module.scss";
import { displaySideIcon } from "@/UI/utils/Icons";

// Types
type SummaryDetail = {
  orderDate: string;
  currencyPair: string;
  product: string;
  side: string;
  tenor: string;
  wethAmount: number;
  usdcAmount: number;
  orderLimit: number;
};

type SummaryProps = {
  detail: SummaryDetail;
};

const Summary = ({ detail }: SummaryProps) => {
  const summaryConfig = [
    { label: "Order Date", render: () => renderDate(detail.orderDate) },
    {
      label: "Currency Pair",
      render: () => <div className={styles.currency}>{formatCurrencyPair(detail.currencyPair)}</div>,
    },
    { label: "Product", render: () => detail.product },
    { label: "Side", render: () => displaySideIcon(detail.side) },
    { label: "Tenor", render: () => renderDate(detail.tenor) },
    {
      label: "Collateral Amount",
      render: () => <CollateralAmount wethAmount={detail.wethAmount} usdcAmount={detail.usdcAmount} />,
    },
    { label: "Order Limit", render: () => detail.orderLimit },
  ];

  return (
    <div className={styles.summary}>
      {summaryConfig.map((item, index) => (
        <div className={styles.row} key={index}>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.value}>{item.render()}</div>
        </div>
      ))}
    </div>
  );
};

export default Summary;
