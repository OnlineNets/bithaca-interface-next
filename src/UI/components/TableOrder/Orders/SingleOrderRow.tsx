import cn from "classnames";

import Delete from "@/UI/components/Icons/Delete";
import Button from "@/UI/components/Button/Button";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { TABLET2_BREAKPOINT } from "@/UI/constants/breakpoints";
import CollateralAmount from "@/UI/components/CollateralAmount/CollateralAmount";

import styles from "../TableOrder.module.scss";
import { formatOrderStatus } from "../helpers";
import { TABLE_TYPE, TableRowDataWithExpanded } from "../types";
import { Separator } from "../components/Separator";
import DropdownOutlined from "../../Icons/DropdownOutlined";
import DiagramIcon from "@/assets/icons/diagram.svg";
import PositiveNegativeLabel from "../../TableCollateral/PositiveNegativeLabel";
import { displaySideIcon } from "@/UI/utils/Icons";

type SingleOrderRowProps = {
  row: TableRowDataWithExpanded;
  cancelOrder?: boolean;
  handleCancelOrderClick?: (index: number) => void;
  handleOpenPayoffDiagram?: (row: TableRowDataWithExpanded) => void;
  rowIndex: number;
  handleRowExpand: (index: number) => void;
  expandedRow: number[];
  type: TABLE_TYPE;
};

const SingleOrderRow = (props: SingleOrderRowProps) => {
  const {
    handleOpenPayoffDiagram,
    type,
    row,
    cancelOrder,
    handleCancelOrderClick,
    rowIndex,
    handleRowExpand,
    expandedRow,
  } = props;
  const tablet2Breakpoint = useMediaQuery(TABLET2_BREAKPOINT);

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
        {cancelOrder && tablet2Breakpoint && (
          <Button
            title='Click to cancel order'
            className={styles.delete}
            onClick={() => handleCancelOrderClick?.(rowIndex)}
          >
            <Delete />
          </Button>
        )}
      </div>
      <div className={styles.cellContent}>{row.orderDate}</div>
      <div className={styles.cellContent}>
        <div className={styles.currency}>{row.currencyPair}</div>
      </div>
      <div className={styles.cellContent}>{row.product}</div>
      <div className={styles.cellContent}>{displaySideIcon(row.side)}</div>
      <div className={cn(styles.cellContent, "tw-flex tw-flex-col !tw-items-start tw-justify-center")}>
        <p>{row.strikeGroup.slice(0, 3).join(" | ")}</p>
        <p>{row.strikeGroup.slice(3, 6).join(" | ")}</p>
      </div>
      <div className={styles.cellContent}>{row.tenor}</div>
      <div className={cn(styles.cellContent, "tw-justify-end")}>
        <CollateralAmount wethAmount={row.wethAmount} usdcAmount={row.usdcAmount} />
      </div>
      {type === TABLE_TYPE.HISTORY && (
        <div className={cn(styles.cellContent, "tw-justify-end")}>{!!row.modelPrice && row.modelPrice.toFixed(3)}</div>
      )}
      <div className={cn(styles.cellContent, "tw-justify-end")}>
        <PositiveNegativeLabel
          labelClassName='!tw-text-xs'
          className='!tw-items-end'
          value={row.orderLimit}
          showAbsValue={true}
        />
      </div>
      {type === TABLE_TYPE.HISTORY && (
        <div className={cn(styles.cellContent, "tw-justify-end")}>
          <button
            title='Show Payoff Diagram'
            className='tw-cursor-pointer tw-stroke-ithaca-white-60 hover:tw-stroke-white'
            onClick={() => handleOpenPayoffDiagram?.(row)}
          >
            <DiagramIcon />
          </button>
        </div>
      )}
      {type === TABLE_TYPE.LIVE && (
        <>
          <div className={cn(styles.cellContent, "tw-justify-center")}>GTC</div>
          <div className={cn(styles.cellContent, "tw-justify-end")}>{formatOrderStatus(row.orderStatus)}</div>
          <div className={styles.cellContent} style={{ justifyContent: "center" }}>
            {row.fill.toFixed(2)}%
          </div>
        </>
      )}

      <div className={cn(styles.cellContent, "tw-justify-end")}>
        {!tablet2Breakpoint && cancelOrder && (
          <Button
            title='Click to cancel order'
            className={styles.delete}
            onClick={() => handleCancelOrderClick?.(rowIndex)}
          >
            <Delete />
          </Button>
        )}
      </div>
    </>
  );
};

export default SingleOrderRow;
