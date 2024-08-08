import cn from "classnames";

import Button from "@/UI/components/Button/Button";
import { formatNumberByFixedPlaces } from "@/UI/utils/Numbers";
import { renderDate } from "@/UI/utils/TableOrder";

import DropdownOutlined from "../../Icons/DropdownOutlined";
import styles from "../TableOrder.module.scss";
import { Separator } from "../components/Separator";
import { PositionRow } from "../types";
import { POSITIONS_DECIMAL_PLACES } from "@/UI/utils/constants";

type SingleOrderRowProps = {
  row: PositionRow;
  cancelOrder?: boolean;
  rowIndex: number;
  handleRowExpand: (index: number) => void;
  expandedRow: number[];
  handleOpenPayoffDiagram?: (row: PositionRow) => void;
  handleOpenPositionCloseModal?: (row: PositionRow) => void;
};

const SinglePositionRow = (props: SingleOrderRowProps) => {
  const { row, rowIndex, handleRowExpand, expandedRow, handleOpenPositionCloseModal } = props;
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
      <div
        className={styles.cellContent}
        style={{ padding: "8px 0px", justifyContent: "flex-start", gridColumn: "span 2" }}
      >
        {row.tenor && renderDate(row.tenor)}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-start" }}>
        {row.product}
      </div>
      <div className={styles.cellContent} style={{ gridColumn: "span 2" }}>
        {row.strike}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-end", marginRight: 6 }}>
        {formatNumberByFixedPlaces(row.quantity, POSITIONS_DECIMAL_PLACES)}
      </div>
      <div className={styles.cellContent} style={{ justifyContent: "flex-end", marginRight: 6 }}>
        {formatNumberByFixedPlaces(row.averagePrice, POSITIONS_DECIMAL_PLACES)}
      </div>
      <div></div>
      <div className={cn(styles.cellContent, "tw-justify-end")}>
        <Button
          className='tw-h-[21px] tw-w-[71px] tw-border-red-500 tw-text-red-500'
          size='sm'
          variant='outline'
          title='Show Payoff Diagram'
          onClick={() => handleOpenPositionCloseModal?.(row)}
        >
          Close
        </Button>
      </div>
    </>
  );
};

export default SinglePositionRow;
