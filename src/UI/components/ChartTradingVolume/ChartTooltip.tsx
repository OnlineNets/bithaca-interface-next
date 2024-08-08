// Packages
import { TooltipProps } from "recharts";

// Styles
import styles from "./ChartTradingVolume.module.scss";

const ChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const rows = payload.map((entry, index) => {
      return {
        label: entry.name,
        value: entry.value,
      };
    });

    return (
      <div className={styles.tooltip}>
        <h3>{payload[0].payload.date}</h3>
        {rows.map((row, index) => (
          <div key={index} className={styles.row}>
            <p>{row.label}:</p>
            <div className={styles.value}>{row.value || row.value === 0 ? Math.round(row.value) : ""}</div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default ChartTooltip;
