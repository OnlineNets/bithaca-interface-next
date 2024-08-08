import { TABLE_TYPE, TableExpandedRowData, TableRowDataWithExpanded } from "../TableOrder/types";
import TableStrategy from "../TableStrategy/TableStrategy";
import { estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";
import ChartPayoff from "../ChartPayoff/ChartPayoff";
import { getOptionLegsFormatted, getStrategiesFormatted } from "./helpers";
import {
  TABLE_STRATEGY_HEADERS_POSITIONS_TABLE,
  TABLE_STRATEGY_HEADERS_TRADE_HISTORY_TABLE,
} from "@/UI/constants/tableStrategy";

export type LegFormatted = {
  type: string;
  side: string;
  size: number;
  strike?: number; // doesnt exist for forwards
  averageExecutionPrice?: number;
  expiry?: string;
};

interface PayoffSectionProps {
  data?: LegFormatted[];
  tableType: TABLE_TYPE;
}
const PayoffSection = ({ data, tableType }: PayoffSectionProps) => {
  if (!data) {
    return null;
  }

  const strategyFormatted = getStrategiesFormatted(data);
  const formattedLegs = getOptionLegsFormatted(data);
  const chartTransformedData = tableType === TABLE_TYPE.HISTORY ? estimateOrderPayoff(formattedLegs) : [];

  return (
    <div>
      <h3 className='mb-13'>Strategy</h3>
      {strategyFormatted && (
        <TableStrategy
          headers={
            tableType === TABLE_TYPE.HISTORY
              ? TABLE_STRATEGY_HEADERS_TRADE_HISTORY_TABLE
              : TABLE_STRATEGY_HEADERS_POSITIONS_TABLE
          }
          showStrike={tableType === TABLE_TYPE.HISTORY}
          // tableClassName='!tw-min-h-fit !tw-max-h-fit'
          hideClear={true}
          strategies={strategyFormatted}
        />
      )}
      {chartTransformedData && tableType === TABLE_TYPE.HISTORY && (
        <ChartPayoff showProfitLoss={false} chartData={chartTransformedData} height={210} id='dynamic-chart' />
      )}
    </div>
  );
};

export default PayoffSection;
