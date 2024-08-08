// Utils
import { formatCurrencyPair, renderDate } from "@/UI/utils/TableOrder";

// Components
import Button from "@/UI/components/Button/Button";
import DropdownOutlined from "../../Icons/DropdownOutlined";
import { Separator } from "../components/Separator";

// Styles
import styles from "../TableOrder.module.scss";
import { SettlementRow } from "../types";
import CollateralAmount from "../../CollateralAmount/CollateralAmount";

type SingleOrderRowProps = {
  row: SettlementRow;
  rowIndex: number;
  handleRowExpand: (index: number) => void;
  expandedRow: number[];
};

const SingleSettlementRow = (props: SingleOrderRowProps) => {
  const { row, rowIndex, handleRowExpand, expandedRow } = props;
  return (
    <>
      {rowIndex > 0 && <Separator />}
      <div
        onKeyDown={() => handleRowExpand(rowIndex)}
        onClick={() => handleRowExpand(rowIndex)}
        className={styles.cell}
      >
        <Button
          title='Click to expand dropdown'
          className={`${styles.dropdown} ${expandedRow.includes(rowIndex) ? styles.isActive : ""}`}
        >
          <DropdownOutlined />
        </Button>
      </div>
      <div className={styles.cellContent} style={{ padding: "8px 0px", justifyContent: "flex-start" }}>
        {row.tenor && renderDate(row.tenor)}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-start" }}>
        {formatCurrencyPair(row.currencyPair)}
      </div>
      <div className={styles.cellContent} style={{}}>
        {row.settlementPrice}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-end" }}>
        {row.payout && (
          <CollateralAmount wethAmount={row.payout.underlierAmount} usdcAmount={row.payout.numeraireAmount} />
        )}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-end" }}>
        {row.totalCollateral && (
          <CollateralAmount
            wethAmount={row.totalCollateral.underlierAmount}
            usdcAmount={row.totalCollateral.numeraireAmount}
          />
        )}
      </div>
    </>
  );
};

export default SingleSettlementRow;
