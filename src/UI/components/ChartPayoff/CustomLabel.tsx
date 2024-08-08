// Props
import { PayoffDataProps, SpecialDotLabel } from "@/UI/constants/charts/charts";
import { LabelPositionProp } from "@/UI/utils/CalcChartPayoff";

// Types
type LabelProps = {
  x?: number | string;
  y?: number | string;
  value?: number | string;
  base: number | string;
  dataSize: number;
  index?: number;
  special: SpecialDotLabel[];
  dataList: PayoffDataProps[];
  height: number;
  labelPosition: LabelPositionProp[];
};

const CustomLabel = (props: LabelProps) => {
  const { x, y, index, special, dataList, height, labelPosition } = props;

  function renderLabel() {
    // if (labelPosition.length == 0) {
    const dataPoint = dataList[Number(index)];
    const prevDataPoint = dataList[Number(index) - 1];
    const nextDataPoint = dataList[Number(index) + 1];
    return (
      <text
        x={x}
        y={Number(y) >= height - 30 ? height - 30 : Number(y)}
        // dx={13}
        dx={
          dataPoint.value === 0
            ? prevDataPoint.value > nextDataPoint.value
              ? 15
              : -15
            : prevDataPoint.value <= dataPoint.value
              ? dataPoint.value === nextDataPoint.value
                ? -15
                : 15
              : dataPoint.value < nextDataPoint.value
                ? 15
                : -15
        }
        // dy={dataPoint.value > prevDataPoint.value ? 20 : -20}
        dy={
          dataPoint.value === 0
            ? -5
            : prevDataPoint.value <= dataPoint.value
              ? dataPoint.value < nextDataPoint.value
                ? 10
                : -10
              : dataPoint.value > nextDataPoint.value
                ? -10
                : 10
        }
        fill='#9D9DAA'
        fontSize={11}
        textAnchor='middle'
        key={index}
      >
        {Math.round(dataList[Number(index)].x)}
      </text>
    );
    // } else {
    //   const PrevPosition: LabelPositionProp = labelPosition[labelPosition.length - 1];
    //   const prevX = PrevPosition.x;
    //   const prevY = PrevPosition.y;
    //   const prevOffset = PrevPosition.offset;
    //   if (prevX - 5 < Number(x) && prevX + 5 >= Number(x)) {
    //     if (prevY - 20 < Number(y) && prevY + 20 >= Number(y)) {
    //       return (
    //         <text
    //           x={x}
    //           y={Number(y) >= height - 20 ? height - 20 : prevOffset}
    //           dx={10}
    //           dy={20}
    //           fill='#9D9DAA'
    //           fontSize={9}
    //           textAnchor='middle'
    //           key={index}
    //         >
    //           {Math.round(dataList[Number(index)].x)}
    //         </text>
    //       );
    //     } else {
    //       return (
    //         <text
    //           x={x}
    //           y={Number(y) >= height - 30 ? height - 30 : Number(y)}
    //           dx={10}
    //           dy={20}
    //           fill='#9D9DAA'
    //           fontSize={9}
    //           textAnchor='middle'
    //           key={index}
    //         >
    //           {Math.round(dataList[Number(index)].x)}
    //         </text>
    //       );
    //     }
    //   } else {
    //     return (
    //       <text
    //         x={x}
    //         y={Number(y) >= height - 30 ? height - 30 : Number(y)}
    //         dx={10}
    //         dy={20}
    //         fill='#9D9DAA'
    //         fontSize={9}
    //         textAnchor='middle'
    //         key={index}
    //       >
    //         {Math.round(dataList[Number(index)].x)}
    //       </text>
    //     );
    //   }
    // }
  }
  // if (
  //   special.find(item => item.x == dataList[index ?? 0]?.x) || (value === 0 && dataList[index ? index - 1 : 0]?.value !== 0)
  // ) {
  //   return renderLabel();
  // }

  const filteredSpecial = filterSpecialList(special);
  if (filteredSpecial.find(item => item.x == dataList[index ?? 0]?.x && item.value == dataList[index ?? 0]?.value)) {
    return renderLabel();
  } else if (
    dataList[index ?? 0].value === 0 &&
    dataList[index && index > 0 ? index - 1 : 0].value !== 0 &&
    !filteredSpecial.find(item => item.x == dataList[index ?? 0]?.x) &&
    !filteredSpecial.find(item => Math.abs(item.x - (dataList[index ?? 0]?.x ?? 0)) < 25)
  ) {
    return renderLabel();
  }
  return null;
};

export default CustomLabel;

const filterSpecialList = (special: SpecialDotLabel[]) => {
  return special.reduce((arr, item) => {
    if (!arr.length) {
      arr.push(item);
    } else {
      const sameX = arr.findIndex(i => i.x === item.x);
      if (sameX >= 0) {
        if (arr[sameX].value > item.value) {
          arr[sameX].value = item.value;
        }
      } else {
        arr.push(item);
      }
    }
    return arr;
  }, [] as SpecialDotLabel[]);
};
