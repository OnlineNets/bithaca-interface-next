import { useState } from "react";
// Packages
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

// Styles
import styles from "./ChartTradeCount.module.scss";
import { formatNumber } from "@/UI/utils/Numbers";
import ChartLegend from "./ChartLegend";
import { TradeDetail } from "@/pages/analytics/useData";
import { ExpiryList } from "@/pages/analytics";

// Types
type ChartTradeCountProps = {
  data: TradeDetail[];
  expiryList: ExpiryList[];
};

const MIN_WIDTH = 20;

const ChartTradeCount = ({ data, expiryList }: ChartTradeCountProps) => {
  const [longestTick, setLongestTick] = useState("");

  const tickFormatter = (tick: number) => {
    const formattedTick = formatNumber(tick, "int");
    if (longestTick.length < formattedTick.length) {
      setLongestTick(formattedTick);
    }
    return formattedTick;
  };

  const getYAxisTickLen = () => {
    const charWidth = 7;

    const width = longestTick.length * charWidth;
    return width < MIN_WIDTH ? MIN_WIDTH : width;
  };

  return (
    <ResponsiveContainer className={styles.container} width='100%' height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 18,
          right: 10,
          left: 2,
          bottom: 35,
        }}
      >
        <Legend layout='vertical' verticalAlign='bottom' align='center' content={<ChartLegend />} />
        <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255, 255, 255, 0.2)' />
        <defs>
          <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='20%' stopColor='#5EE192' stopOpacity={0.2} />
            <stop offset='100%' stopColor='#5EE192' stopOpacity={0} />
          </linearGradient>
          <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur in='SourceGraphic' stdDeviation='2' result='blur' />
          </filter>
          <linearGradient id='strokeGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#5EE192' stopOpacity={1} />
            <stop offset='100%' stopColor='#FFFFFF' stopOpacity={1} />
          </linearGradient>
        </defs>
        <XAxis dataKey='date' tickLine={false} axisLine={false} style={{ fill: "#9D9DAA", fontSize: 12 }} dy={5} />
        <YAxis
          type='number'
          tickFormatter={tickFormatter}
          width={getYAxisTickLen()}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          className={styles.chartTradeCountLabel}
        />

        <Area legendType='none' dataKey='volume' fill='url(#gradient)' filter='url(#glow)' />
        <Area
          type='monotone'
          legendType='circle'
          name='Total'
          dataKey='volume'
          stroke='#5ee192'
          strokeWidth={2}
          fill='transparent'
        />
        {expiryList.map(({ name, color }) => {
          return (
            <Area
              key={name}
              type='monotone'
              legendType='circle'
              dataKey={name}
              stroke={color}
              strokeWidth={1}
              fill='transparent'
            />
          );
        })}
        <Area name='NAFwd' type='monotone' legendType='circle' dataKey={"7Jan99"} stroke={"#31CBE0"} strokeWidth={1} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ChartTradeCount;
