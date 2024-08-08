// Packages
import { TooltipProps } from "recharts";

// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

// Styles
import styles from "./ChartMaxPain.module.scss";

// Types
type ValueType = number;
type NameType = string;

const ChartTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as { call: number; put: number; strike: number };

    const rows = [
      { label: "Strike", value: data.strike },
      { label: "Call: Max Pain", value: data.call },
      { label: "Short: Max Pain", value: data.strike },
    ];

    return (
      <div className={styles.tooltip}>
        {rows.map((row, index) => (
          <div key={index} className={styles.row}>
            <p>{row.label}</p>
            <div className={styles.value}>
              {row.value}
              <LogoEth />
              <span>WETH</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default ChartTooltip;
