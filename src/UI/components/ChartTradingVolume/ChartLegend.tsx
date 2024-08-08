import { LegendType, Surface, Symbols } from "recharts";

// Styles
import styles from "./ChartTradingVolume.module.scss";

type LegendPayloadItem = {
  color: string;
  value: string;
  type: LegendType;
  payload: {
    value: number;
  };
};

type ChartLegendProps = {
  payload?: LegendPayloadItem[];
};

const ChartLegend = ({ payload }: ChartLegendProps) => {
  return (
    <div className={styles.legend}>
      {payload &&
        payload.map((entry, index) => {
          if (entry.type === "none") {
            return null;
          }
          return (
            <div className={styles.row} key={`item-${index}`}>
              <Surface width={8} height={8}>
                <Symbols cx={4} cy={4} type='circle' size={32} fill={entry.color} />
              </Surface>
              <span className={styles.label}>{entry.value}</span>
            </div>
          );
        })}
    </div>
  );
};

export default ChartLegend;
