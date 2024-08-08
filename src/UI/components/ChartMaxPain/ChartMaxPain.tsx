// Packages
import { useState, useEffect } from "react";
import { ChartMaxPainData } from "@/UI/constants/charts/chartMaxPain";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CategoricalChartState } from "recharts/types/chart/generateCategoricalChart";
import dayjs from "dayjs";
// Components
import ChartLegend from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";
import ChartCursor from "./ChartCursor";
import ChartLabel from "./ChartLabel";

// Styles
import styles from "./ChartMaxPain.module.scss";
import { maxPainChartFormat } from "@/UI/utils/MaxPainChartUtil";
import { useAppStore } from "@/UI/lib/zustand/store";
import { Strike } from "@/pages/analytics/useData";
import { API_DATE_FORMAT, DEFAULT_INPUT_DATE_FORMAT } from "@/UI/utils/DateFormatting";

const MINIMUM_STRIKE = 0;
const MAXIMUM_STRIKE = 200000000;

const ChartMaxPain = () => {
  const { ithacaSDK, currentExpiryDate } = useAppStore();

  const [data, setData] = useState<Strike | null>(null);

  const fetchData = async (currentExpiryDate: number) => {
    const dateFormatted = dayjs(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT);
    try {
      const data = await ithacaSDK.analytics.openInterestByStrike(
        "WETH",
        "USDC",
        dateFormatted.format(API_DATE_FORMAT),
        dateFormatted.add(1, "day").format(API_DATE_FORMAT),
        MINIMUM_STRIKE,
        MAXIMUM_STRIKE
      );

      setData(data);
    } catch (e) {
      console.error("Error fetching data", e);
    }
  };

  useEffect(() => {
    fetchData(currentExpiryDate);
  }, [currentExpiryDate]);

  const [chartData, setChartData] = useState<ChartMaxPainData[]>([]);

  useEffect(() => {
    setChartData(maxPainChartFormat(data));
  }, [data]);

  const [cursorX, setCursorX] = useState(0);

  const handleMouseMove = (e: CategoricalChartState) => {
    if (e.activePayload) {
      const xValue = e.chartX;
      setCursorX(xValue ?? 0);
    }
  };

  return (
    <div>
      <div className={styles.leftLabel}>Open Interest</div>
      <ResponsiveContainer className={styles.container} width='100%' height={300}>
        <BarChart
          barCategoryGap={33}
          data={chartData}
          margin={{
            top: 18,
            right: 46,
            left: 20,
            bottom: 35,
          }}
          onMouseMove={handleMouseMove}
        >
          <ReferenceLine
            x={1500}
            stroke='#561198'
            strokeDasharray={"2 2"}
            label={<ChartLabel label='Max Pain' value='1600' />}
          />
          <ReferenceLine
            x={1600}
            stroke='#9D9DAA'
            strokeDasharray={"2 2"}
            label={<ChartLabel label='Underlying Price' value='1700' />}
          />
          <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255, 255, 255, 0.2)' />
          <defs>
            <linearGradient id='greenGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='20.31%' stopColor='#4BB475' stopOpacity='1' />
              <stop offset='100%' stopColor='#4BB475' stopOpacity='0' />
            </linearGradient>
          </defs>
          <defs>
            <linearGradient id='redGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='20.31%' stopColor='#FF3F57' stopOpacity='1' />
              <stop offset='100%' stopColor='#FF3F57' stopOpacity='0' />
            </linearGradient>
          </defs>
          <XAxis dataKey='strike' tickLine={false} axisLine={false} className={styles.chartMaxPainLabel} dy={5}>
            <Label value='Strikes' offset={10} position='bottom' className={styles.axisLabel} />
          </XAxis>
          <YAxis
            type='number'
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            dx={-5}
            className={`${styles.axisLabel} ${styles.chartMaxPainLabel}`}
          />
          <Tooltip content={<ChartTooltip />} cursor={<ChartCursor x={cursorX} />} />
          <Legend verticalAlign='bottom' align='right' content={<ChartLegend />} />
          <Bar dataKey='call' fill='url(#greenGradient)' barSize={20} radius={[4, 4, 0, 0]} />
          <Bar dataKey='put' fill='url(#redGradient)' barSize={20} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartMaxPain;
