import { KeyOption, PayoffDataProps, SpecialDotLabel } from "../constants/charts/charts";

const isIncrementing = (arr: PayoffDataProps[]) => {
  let result = true;

  if (arr[0].value != arr[1].value) {
    for (let i = 0; i < arr.length - 2; i++) {
      if (arr[i].value > arr[i + 1].value) {
        result = false;
        break;
      }
    }
  } else if (arr[arr.length - 1].value != arr[arr.length - 2].value) {
    for (let i = 0; i < arr.length - 2; i++) {
      if (arr[i].value > arr[i + 1].value) {
        result = false;
        break;
      }
    }
  } else if (arr[0].value == arr[1].value && arr[arr.length - 1].value == arr[arr.length - 2].value) {
    result = false;
  }

  return result;
};

export const gradientOffset = (xAxis: number, height: number, data: PayoffDataProps[]) => {
  const max = Math.max(...data.map(i => i.value));
  const min = Math.min(...data.map(i => i.value));
  if (max <= 0) {
    return 1;
  }
  if (min >= 0) {
    return 0;
  }
  return max / (max - min);
};

export const showGradientTags = (
  off: number,
  color: string,
  dashedColor: string,
  id: string,
  selectedLeg: string,
  notStraightLine = true
) => {
  return (
    <defs>
      {/* Area gradient */}
      {selectedLeg === "total" && (
        <linearGradient id={`fillGradient-${id}`} x1='0' y1='0' x2='0' y2='1'>
          {off !== 1 ? (
            <>
              <stop offset='0%' stopColor='#4bb475' stopOpacity={0.2} />
            </>
          ) : (
            ""
          )}
          {off !== 1 ? <stop offset={off === 0 ? 1 : off} stopColor='#4bb475' stopOpacity={0} /> : ""}
          {off !== 1 && off !== 0 ? <stop offset={off} stopColor='#8884d8' stopOpacity={0} /> : ""}
          {off !== 0 ? <stop offset={off === 1 ? 0 : off} stopColor='#FF3F57' stopOpacity={0} /> : ""}
          {off !== 0 ? (
            <>
              <stop offset='100%' stopColor='#FF3F57' stopOpacity={0.3} />
            </>
          ) : (
            ""
          )}
        </linearGradient>
      )}

      <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
        <feGaussianBlur in='SourceGraphic' stdDeviation='2' result='blur' />
      </filter>

      {/* Core line gradient */}
      <linearGradient id={`lineGradient-${id}`} x1='0' y1='0' x2='0' y2='1'>
        {off !== 1 ? (
          <>
            <stop offset='0%' stopColor={selectedLeg === "total" ? "#4bb475" : color} stopOpacity={1} />
          </>
        ) : (
          ""
        )}
        {off !== 1 ? (
          <stop
            offset={off === 0 ? 1 : off - 0.1}
            stopColor={selectedLeg === "total" ? "#4bb475" : color}
            stopOpacity={1}
          />
        ) : (
          ""
        )}
        {notStraightLine ? (
          <stop offset={off === 1 ? 0 : off} stopColor={selectedLeg === "total" ? "#fff" : color} stopOpacity={1} />
        ) : (
          ""
        )}
        {off !== 0 ? (
          <stop
            offset={off === 1 ? 0 : off + 0.1}
            stopColor={selectedLeg === "total" ? "#FF3F57" : color}
            stopOpacity={1}
          />
        ) : (
          ""
        )}
        {off !== 0 ? (
          <>
            <stop offset='100%' stopColor={selectedLeg === "total" ? "#FF3F57" : color} stopOpacity={1} />
          </>
        ) : (
          ""
        )}
      </linearGradient>

      {dashedColor && (
        <linearGradient id={`dashGradient-${id}`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='90%' stopColor={dashedColor} stopOpacity={0.4} />
          <stop offset='5%' stopColor={dashedColor} stopOpacity={0.3} />
          <stop offset='5%' stopColor={dashedColor} stopOpacity={0.1} />
        </linearGradient>
      )}
    </defs>
  );
};

export const breakPointList = (data: PayoffDataProps[]) => {
  const step = data[1].x - data[0].x;
  const deviation = calculateStandardDeviation(data);
  const offsets: SpecialDotLabel[] = [];
  let preTanValue = 0;
  for (let i = 0; i < data.length - 1; i++) {
    const tanValue =
      (parseFloat(data[i].value.toFixed(5)) - parseFloat(data[i + 1].value.toFixed(5))) / (data[i].x - data[i + 1].x);
    if (
      tanValue === Infinity ||
      (preTanValue !== tanValue && Math.round((preTanValue / tanValue) * 10) / 10 !== 1 && data[i].value !== 0) ||
      (i !== data.length && data[i].value > 0 && data[i + 1].value < 0) ||
      (data[i].value < 0 && data[i + 1].value > 0)
    ) {
      // if (tanValue === Infinity || (preTanValue !== tanValue  &&  data[i].value !== 0)) {
      const t = Math.round((preTanValue / tanValue) * 10) / 10;
      const test = data[i].value - data[i + 1].value;
      preTanValue = tanValue;
      if (i === 0) continue;
      const existingObject = offsets.find(offset => offset.value === data[i].value);
      if (existingObject) {
        if (Math.abs(data[i].x - existingObject.x) > 1) {
          offsets.push({
            x: data[i].x,
            value: data[i].value,
          });
        } else if (data[i].x % 10 === 0) {
          existingObject.x = data[i].x;
        }
      } else {
        offsets.push({
          x: data[i].x,
          value: data[i].value,
        });
      }
    }
  }

  offsets.sort((a, b) => a.x - b.x);

  const filteredData = offsets.filter((item, index, array) => {
    if (index === array.length - 1) {
      return true;
    } else {
      const nextX = array[index + 1].x;
      if (nextX - item.x >= step) {
        return true;
      } else {
        return Math.abs(array[index + 1].value - item.value) > deviation;
      }
    }
  });

  return filteredData;
};

const calculateStandardDeviation = (data: PayoffDataProps[]) => {
  const n = data.length;

  const mean = data.reduce((sum, item) => sum + item.value, 0) / n;

  const squaredDifferences = data.reduce((sum, item) => {
    const difference = item.value - mean;
    return sum + difference * difference;
  }, 0);

  const variance = squaredDifferences / n;

  const standardDeviation = Math.sqrt(variance);

  return standardDeviation;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makingChartData = (data: any[], key: KeyOption, dashed: KeyOption) => {
  const result: PayoffDataProps[] = data.map(item => ({
    value: item[key.value],
    dashValue: dashed.value != "" ? item[dashed.value] : undefined,
    x: item["x"],
  }));
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLegs = (data: any[]) => {
  const keys = Object.keys(data[0])
    .filter(item => !["x"].includes(item))
    .map(k => {
      return {
        option: k.split("@")[0],
        value: k,
      };
    });
  return keys;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findOverallMinMaxValues = (data: any, leg: string) => {
  let overallMin = Infinity;
  let overallMax = -Infinity;

  // Iterate over the data array to find overall min and max values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((entry: any) => {
    Object.keys(entry).forEach(key => {
      if (key !== "x" && key === leg) {
        overallMin = Math.min(overallMin, entry[key]);
        overallMax = Math.max(overallMax, entry[key]);
      }
    });
  });

  return { min: overallMin, max: overallMax };
};
