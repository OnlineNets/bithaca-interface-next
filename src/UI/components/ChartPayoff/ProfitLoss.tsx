// Components
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

// Styles
import styles from "./ChartPayoff.module.scss";

// Utils
import { formatNumberByCurrency } from "@/UI/utils/Numbers";

// Types
type ProfitLossProps = {
  value: number;
  isChartHovered: boolean;
};

const ProfitLoss = (props: ProfitLossProps) => {
  const { value, isChartHovered } = props;
  const formattedValue = formatNumberByCurrency(value, "string", "USDC");

  const renderProfitLoss = () => {
    if (!isChartHovered) {
      return <p>-</p>;
    }

    const sign = value > 0 ? "+" : value < 0 ? "" : "";
    const className = value > 0 ? styles.greenColor : value < 0 ? styles.redColor : styles.whiteColor;
    return (
      <p className={className}>
        {sign}
        {formattedValue}
      </p>
    );
  };

  return (
    <>
      <h3>Potential P&L:</h3>
      {renderProfitLoss()}
      <LogoUsdc />
    </>
  );
};

export default ProfitLoss;
