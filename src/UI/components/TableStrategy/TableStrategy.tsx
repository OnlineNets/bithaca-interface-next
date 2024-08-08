// Constants
import {
  TABLE_STRATEGY_HEADERS,
  TABLE_STRATEGY_HEADERS_POSITIONS_TABLE,
  TABLE_STRATEGY_HEADERS_STORIES,
} from "@/UI/constants/tableStrategy";

// Utils
import { displaySideIcon } from "@/UI/utils/Icons";

// Components
import Button from "@/UI/components/Button/Button";
import Remove from "@/UI/components/Icons/Remove";

// Styles
import styles from "./TableStrategy.module.scss";
import { PositionBuilderStrategy } from "@/pages/trading/position-builder";
import Dot from "../Dot/Dot";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import classNames from "classnames";

type StrategyTableProps = {
  strategies: PositionBuilderStrategy[];
  removeRow?: (index: number) => void;
  clearAll?: () => void;
  hideClear?: boolean;
  tableClassName?: string;
  showStrike?: boolean;
  headers?: string[];
};

const TableStrategy = ({
  strategies,
  removeRow,
  clearAll,
  hideClear = false,
  tableClassName,
  showStrike = true,
  headers,
}: StrategyTableProps) => {
  const isReferencePriceAvailable =
    Boolean(strategies[0]?.referencePrice) || Boolean(strategies[0]?.referencePrice === 0);

  const getHeaderColumns = () => {
    if (headers) {
      return headers;
    }

    if (isReferencePriceAvailable) {
      return TABLE_STRATEGY_HEADERS;
    }

    return TABLE_STRATEGY_HEADERS_STORIES;
  };
  return (
    <div className={styles.tableContainer}>
      <div className={classNames(styles.table, tableClassName)}>
        <div
          style={{
            gridTemplateColumns: !isReferencePriceAvailable
              ? "repeat(6, minmax(0, 1fr))"
              : !hideClear
                ? "repeat(8, minmax(0, 1fr))"
                : "repeat(7, minmax(0, 1fr))",
          }}
          className={styles.header}
        >
          {getHeaderColumns().map((header, idx) => (
            <div className={styles.cell} key={idx}>
              {header}
            </div>
          ))}
        </div>
        {strategies.length ? (
          strategies.map((strategy, idx) => (
            <div
              style={{
                gridTemplateColumns: !isReferencePriceAvailable
                  ? "repeat(6, minmax(0, 1fr))"
                  : !hideClear
                    ? "repeat(8, minmax(0, 1fr))"
                    : "repeat(7, minmax(0, 1fr))",
              }}
              className={styles.row}
              key={idx}
            >
              <div className={styles.cell}>
                <div className={styles.dot}>
                  <Dot type={`leg${idx + 1}`} />
                  <div className={styles.strategy}>
                    {strategy.payoff === "NEXT_AUCTION"
                      ? "Forward(Next Auction)"
                      : strategy.payoff === "BinaryCall"
                        ? "Digital Call"
                        : strategy.payoff === "BinaryPut"
                          ? "Digital Put"
                          : strategy.payoff}
                  </div>
                </div>
              </div>
              <div className={styles.cell}>{displaySideIcon(strategy.leg.side)}</div>
              <div className={styles.cell}>{strategy.leg.quantity}</div>
              {/* Do not display strike for forward */}
              {showStrike ? (
                <div className={styles.cell}>{strategy.strike === "-" ? "" : Number(strategy.strike)}</div>
              ) : (
                <p></p>
              )}
              {(strategy.referencePrice || strategy.referencePrice === 0) && (
                <div className={styles.cell}>
                  {formatNumberByCurrency(Number(strategy.referencePrice), "string", "USDC")}
                </div>
              )}

              {!hideClear && (
                <div className={styles.cell}>
                  <Button title='Click to remove row' variant='icon' onClick={() => removeRow && removeRow(idx)}>
                    <Remove />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyContainer}>Please add a strategy.</div>
        )}
      </div>
      {strategies.length > 0 && !hideClear && (
        <Button className={styles.clearAll} title='Click to clear all' onClick={clearAll} variant='clear'>
          Clear All
        </Button>
      )}
    </div>
  );
};

export default TableStrategy;
