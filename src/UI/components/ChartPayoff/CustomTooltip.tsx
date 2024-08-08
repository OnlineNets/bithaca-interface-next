// Utils

// Styles
import styles from "./ChartPayoff.module.scss";

type Payload = {
  x: number;
  quantity?: number;
};

// Types
type CustomTooltipProps = {
  base: number | string;
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: Payload }>;
  setChangeVal: (state: number) => void;
  x: number;
  y: number;
  height: number;
};

const CustomTooltip = (props: CustomTooltipProps) => {
  const { base, active, payload, setChangeVal, y, height } = props;
  if (active) {
    setChangeVal(payload && Math.abs(payload[0].value) >= 0 ? payload[0].value + Number(base) : 0);
    return (
      <div
        style={{
          marginTop:
            y / height > 0.5 ? 10 + "px" : y / height <= 120 && y != 0 ? height - 40 + "px" : height - 150 + "px",
        }}
      >
        <p className={styles.tooltipLabel}>Price at Expiry</p>
        <p className={styles.tooltipValue}>{(payload && payload[0].payload.x.toFixed(0)) || 0}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
