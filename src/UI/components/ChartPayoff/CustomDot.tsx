// Constants
import { PayoffDataProps, SpecialDotLabel } from "@/UI/constants/charts/charts";
import { useEffect } from "react";

// Types
type CustomDotProps = {
  cx?: number;
  cy?: number;
  stroke?: string;
  base?: number;
  payload?: PayoffDataProps;
  dataSize: number;
  special: SpecialDotLabel[];
  index?: number;
  color?: string;
  compact?: boolean;
  dataList: PayoffDataProps[];
  updatePosition: (val: number) => void;
  updatePnlLabelPosition: (val: number) => void;
};

const CustomDot = (props: CustomDotProps) => {
  const { cx, cy, payload, special, index, dataList, updatePosition, updatePnlLabelPosition, compact, color } = props;
  useEffect(() => {
    const minValue = Math.min(...dataList.map(i => i.value));
    if (payload?.value == minValue) {
      updatePnlLabelPosition(Number(cy));
    }
    if (payload?.value == 0) {
      updatePosition(Number(cy));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCircle = (idx: number) => {
    if (
      Number(payload?.value) === 0 ||
      (idx !== dataList.length && dataList[idx].value > 0 && dataList[idx + 1].value < 0) ||
      (dataList[idx].value < 0 && dataList[idx + 1].value > 0)
    ) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={2}
          fill={color || "#fff"}
          stroke={color || "#fff"}
          strokeWidth={1}
          key={idx}
          opacity={compact ? 0 : 1}
        />
      );
    }
    if (Number(payload?.value) > 0) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={2}
          fill='#5ee192'
          stroke='#5ee192'
          strokeWidth={1}
          key={idx}
          opacity={compact ? 0 : 1}
        />
      );
    }
    if (Number(payload?.value) < 0) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={2}
          fill='#FF3F57'
          stroke='#FF3F57'
          strokeWidth={1}
          key={idx}
          opacity={compact ? 0 : 1}
        />
      );
    }
  };

  if (
    special.find(item => item.x == payload?.x) ||
    (payload?.value === 0 && dataList[index ? index - 1 : 0]?.value !== 0)
  ) {
    return renderCircle(index ?? 0);
  }
  return null;
};

export default CustomDot;
