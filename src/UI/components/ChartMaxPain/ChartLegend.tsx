// Constants
import { LEGEND } from "@/UI/constants/charts/chartMaxPain";

// Styles
import styles from "./ChartMaxPain.module.scss";

const ChartLegend = () => {
  return (
    <div className={styles.legend}>
      {LEGEND.map(item => (
        <span key={item.label}>
          <div className={`${styles[item.classNameKey]}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
};

export default ChartLegend;
