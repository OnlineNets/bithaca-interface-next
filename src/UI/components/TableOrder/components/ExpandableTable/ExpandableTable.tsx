import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { variants } from "@/UI/utils/TableOrder";

import styles from "../../TableOrder.module.scss";
import { TABLE_TYPE } from "../../types";

interface ExpandableTableProps {
  isRowExpanded: boolean;
  type: TABLE_TYPE;
  children: ReactNode;
}

const getClassName = (type: TABLE_TYPE) => {
  switch (type) {
    case TABLE_TYPE.LIVE:
      return styles.gridContainerTableLiveOrders;
    case TABLE_TYPE.SETTLEMENTS:
      return styles.gridContainerTableSettlements;
    default:
      return styles.gridContainerTable;
  }
};

const ExpandableTable = (props: ExpandableTableProps) => {
  const { isRowExpanded, type, children } = props;

  return (
    <AnimatePresence>
      {isRowExpanded && (
        <motion.div
          className={styles.tableRowExpanded}
          initial='closed'
          animate='open'
          exit='closed'
          variants={variants}
        >
          <div className={styles.tableExpanderContainer}>
            <div className={getClassName(type)}>{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpandableTable;
