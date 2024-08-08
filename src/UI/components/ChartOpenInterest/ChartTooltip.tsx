// Packages
import { Surface, Symbols, TooltipProps } from "recharts";

// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

// Styles
import styles from "./ChartOpenInterest.module.scss";
import { getColor } from "./mockedData";
import LogoUsdc from "../Icons/LogoUsdc";

// Types
type ValueType = number;
type NameType = string;

interface AdditionalData {
  name: string;
  type: string;
  volume: number;
}

interface ChartTooltipProps {
  additionalData: AdditionalData[];
}

const Dot = ({ color }: { color: string }) => {
  return (
    <Surface width={8} height={8}>
      <Symbols cx={4} cy={4} type='circle' size={32} fill={color} />
    </Surface>
  );
};

const Currency = ({ name }: { name: string }) => {
  if (name.includes("Binary")) {
    return <LogoUsdc />;
  }

  return <LogoEth />;
};

const ChartTooltip = ({ active, payload, additionalData }: TooltipProps<ValueType, NameType> & ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as { name: string; volume: number };
    const newData = additionalData.filter(item => item.name === data.name);

    return (
      <div className={styles.tooltip}>
        <p className='mb-10'>{data.name}</p>
        {newData.map(item => {
          return (
            <div key={`${data.name}-${item.type}`} className={styles.tooltipValueContainer}>
              <Dot color={getColor(item)} />
              <p>{item.type}:</p>
              <p className={styles.value}>{item.volume}</p>
              <Currency name={item.name} />
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export default ChartTooltip;
