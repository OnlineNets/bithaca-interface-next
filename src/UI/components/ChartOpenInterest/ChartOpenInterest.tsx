// Packages
import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";

// Components
import Watermark from "@/UI/components/Icons/Watermark";
import ChartLegend from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";

// Styles
import styles from "./ChartOpenInterest.module.scss";
import { getColor } from "./mockedData";
import { useAppStore } from "@/UI/lib/zustand/store";
import dayjs from "dayjs";
import { API_DATE_FORMAT, DEFAULT_INPUT_DATE_FORMAT } from "@/UI/utils/DateFormatting";

interface ChartOption {
  name: string;
  type: string;
  volume: number;
}

const ChartOpenInterest = () => {
  const { ithacaSDK, currentExpiryDate } = useAppStore();
  const [activeIndex, setActiveIndex] = useState<number[] | undefined>(undefined);
  const [internalActiveIndex, setInternalActiveIndex] = useState<number[] | undefined>(undefined);

  const [outerData, setOuterData] = useState<ChartOption[]>([]);
  const [innerData, setInnerData] = useState<ChartOption[]>([]);

  const fetchData = async (currentExpiryDate: number) => {
    const dateFormatted = dayjs(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT);
    try {
      const data = await ithacaSDK.analytics.openInterestByProduct(
        "WETH",
        "USDC",
        dateFormatted.format(API_DATE_FORMAT),
        dateFormatted.add(1, "day").format(API_DATE_FORMAT)
      );
      const innerProductTypes = [
        {
          value: "Binary Call",
          label: "Digital Call",
        },
        {
          value: "Binary Put",
          label: "Digital Put",
        },
      ];
      const outerProductTypes = ["Call", "Forward", "Put"];

      setInnerData(
        innerProductTypes
          .map(item => {
            return [
              {
                name: item.label,
                type: "short",
                volume: Math.round(data[item.value]?.totalInNum),
              },
              {
                name: item.label,
                type: "long",
                volume: Math.round(data[item.value]?.totalInNum),
              },
            ];
          })
          .flat()
      );
      setOuterData(
        outerProductTypes
          .map(item => {
            return [
              {
                name: item,
                type: "short",
                volume: Math.round(data[item]?.totalInNum),
              },
              {
                name: item,
                type: "long",
                volume: Math.round(data[item]?.totalInNum),
              },
            ];
          })
          .flat()
      );
    } catch (e) {
      console.error("Error fetching data", e);
    }
  };
  useEffect(() => {
    fetchData(currentExpiryDate);
  }, [currentExpiryDate]);

  const renderLabel = () => {
    return <Watermark />;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <>
        <g style={{ filter: "url(#glow)" }}>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius}
            outerRadius={outerRadius}
            fill={fill}
          />
        </g>
        <defs>
          <filter id='glow'>
            <feGaussianBlur in='SourceGraphic' stdDeviation='5' result='blur' />
            <feFlood floodColor={fill} result='color' />
            <feComposite in2='color' operator='in' />
            <feMerge>
              <feMergeNode in='color' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>
      </>
    );
  };

  const getActiveIndices = (selectedIndex: number): number[] => {
    if (selectedIndex % 2 === 0) {
      return [selectedIndex, selectedIndex + 1];
    } else {
      return [selectedIndex, selectedIndex - 1];
    }
  };

  const onPieEnter = (_: void, index: number) => {
    setActiveIndex(getActiveIndices(index));
    setInternalActiveIndex(undefined);
  };

  const onPieEnterInternal = (_: void, index: number) => {
    setInternalActiveIndex(getActiveIndices(index));
    setActiveIndex(undefined);
  };

  return (
    <div className={styles.pieContainer}>
      <div className={styles.waterMark}>{renderLabel()}</div>
      <ResponsiveContainer className={styles.container} width='100%' height={300}>
        <PieChart>
          <Legend layout='vertical' verticalAlign='top' align='left' content={<ChartLegend />} />
          <defs>
            <linearGradient id='colorGroupA' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='#5CCF8A' />
              <stop offset='100%' stopColor='#4BB475' />
            </linearGradient>
            <linearGradient id='colorGroupB' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='#A855F7' />
              <stop offset='100%' stopColor='#8F2BEF' />
            </linearGradient>
            <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
              <feGaussianBlur in='SourceGraphic' stdDeviation='3' result='blur' />
            </filter>
          </defs>

          <Pie
            onMouseEnter={onPieEnter}
            onMouseLeave={() => setActiveIndex(undefined)}
            activeIndex={activeIndex}
            data={outerData}
            activeShape={renderActiveShape}
            innerRadius={90}
            outerRadius={120}
            fill='#8884d8'
            nameKey='name'
            dataKey='volume'
            startAngle={90}
            endAngle={450}
          >
            {outerData.map(entry => (
              <Cell key={`cell-${entry.name}-${entry.type}`} stroke='none' fill={getColor(entry)} />
            ))}
          </Pie>

          <Pie
            key='inset'
            onMouseEnter={onPieEnterInternal}
            onMouseLeave={() => setInternalActiveIndex(undefined)}
            onMouseOver={onPieEnterInternal}
            activeIndex={internalActiveIndex}
            data={innerData}
            activeShape={renderActiveShape}
            innerRadius={40}
            outerRadius={70}
            fill='#8884d8'
            nameKey='name'
            dataKey='volume'
            startAngle={90}
            endAngle={450}
          >
            {innerData.map(entry => (
              <Cell key={`inset-cell-${entry.name}-${entry.type}`} stroke='none' fill={getColor(entry)} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip additionalData={[...outerData, ...innerData]} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartOpenInterest;
