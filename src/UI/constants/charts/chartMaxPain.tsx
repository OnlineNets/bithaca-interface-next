// Types
export type ChartMaxPainData = {
  strike: number;
  call: number;
  put: number;
};

// Types
export type LegendItem = {
  label: string;
  classNameKey: string;
};

export const LEGEND: LegendItem[] = [
  { label: "Total", classNameKey: "total" },
  { label: "Call: Max Pain", classNameKey: "call" },
  { label: "Put: Max Pain", classNameKey: "put" },
];
