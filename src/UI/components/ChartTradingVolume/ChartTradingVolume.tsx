// Packages
import { BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

// Components
import ChartLegend from "./ChartLegend";

// Styles
import styles from "./ChartTradingVolume.module.scss";
import ChartTooltip from "./ChartTooltip";
import { TradeDetail } from "@/pages/analytics/useData";
import { ExpiryList } from "@/pages/analytics";

// Types
type ChartTradingVolumeProps = {
  data: TradeDetail[];
  expiryList: ExpiryList[];
};
const ChartTradingVolume = ({ data, expiryList }: ChartTradingVolumeProps) => {
  return (
    <ResponsiveContainer className={styles.container} width='100%' height={300}>
      <BarChart
        data={data}
        margin={{
          top: 18,
          right: 46,
          left: -10,
          bottom: 35,
        }}
      >
        <Tooltip cursor={false} wrapperStyle={{ zIndex: 5 }} content={<ChartTooltip />} />
        <Legend layout='vertical' verticalAlign='bottom' align='center' content={<ChartLegend />} />

        <defs>
          <linearGradient id='purpleGradientTrading' x1='0%' y1='0%' x2='0%' y2='100%'>
            <stop offset='20.31%' stopColor='#B5B5F8' stopOpacity='1' />
            <stop offset='100%' stopColor='#B5B5F8' stopOpacity='0' />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255, 255, 255, 0.2)' />

        <XAxis dataKey='date' tickLine={false} axisLine={false} style={{ fill: "#9D9DAA", fontSize: 12 }} dy={5} />
        <YAxis
          type='number'
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          style={{ fill: "#9D9DAA", fontSize: 12 }}
          dx={-5}
        />
        {expiryList.map(({ name, color }) => {
          return <Bar key={name} stackId={"stack"} dataKey={name} fill={color} barSize={14} radius={[0, 0, 0, 0]} />;
        })}
        <Bar stackId={"stack"} name='NAFwd' dataKey={"7Jan99"} fill={"#31CBE0"} barSize={14} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartTradingVolume;
