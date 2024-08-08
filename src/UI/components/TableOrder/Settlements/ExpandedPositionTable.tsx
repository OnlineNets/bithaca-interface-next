import { Fragment } from "react";
// Constants
import { SettlementExpandedInfo, TABLE_ORDER_EXPANDED_HEADERS_FOR_SETTLEMENTS } from "../types";
import styles from "../TableOrder.module.scss";

// Types
type ExpandedTableProps = {
  data: SettlementExpandedInfo[];
};

const EmptyDiv = () => <div></div>;

const ExpandedPositionTable = ({ data }: ExpandedTableProps) => {
  return (
    <>
      <EmptyDiv />
      <div className={styles.headerExpandedTable}>Strategy</div>
      {TABLE_ORDER_EXPANDED_HEADERS_FOR_SETTLEMENTS.map((header, idx) => (
        <div key={idx} className={styles.cell} style={{ flexDirection: "column", ...header.style }}>
          <div className={styles.cell} key={idx}>
            {header.name}
          </div>
        </div>
      ))}
      <EmptyDiv />
      <div style={{ gridColumn: "b/i" }}>
        <div className={styles.separator} />
      </div>
      <EmptyDiv />
      {data.map((item, index) => {
        return (
          <Fragment key={index}>
            <div style={{ gridColumn: "a/j", marginTop: 15 }}></div>
            <EmptyDiv />
            <div className={`${styles.cellContentExpanded} ${styles.bolded}`}>{item.tenor}</div>
            <div className={styles.cellContentExpanded}>{item.product}</div>
            <div className={styles.cellContentExpanded}>{item.strike}</div>
            <div className={styles.cellContentExpanded} style={{ justifyContent: "flex-end" }}>
              {item.quantity}
            </div>
            <div className={styles.cellContentExpanded} style={{ justifyContent: "flex-end" }}>
              {item.avgPrice}
            </div>
            <EmptyDiv />
          </Fragment>
        );
      })}
      <div style={{ gridColumn: "a/j", marginTop: 15 }}></div>
    </>
  );
};

export default ExpandedPositionTable;
