import { ChartMaxPainData } from "@/UI/constants/charts/chartMaxPain";
import { Strike } from "@/pages/analytics/useData";

export const maxPainChartFormat = (data: Strike | null): ChartMaxPainData[] => {
  if (!data) return [];
  const transformedData: ChartMaxPainData[] = Object.keys(data).map(strike => ({
    strike: parseInt(strike),
    call: data[strike]?.Call?.totalInNum ?? 0,
    put: data[strike]?.Put?.totalInNum ?? 0,
  }));

  const strikes = transformedData.map(item => item.strike);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);

  const completeData: ChartMaxPainData[] = [];
  for (let strike = minStrike; strike <= maxStrike; strike += 100) {
    const existingItem = transformedData.find(item => item.strike === strike);
    if (existingItem) {
      completeData.push(existingItem);
    } else {
      completeData.push({ strike: strike, call: 0, put: 0 });
    }
  }
  completeData.sort((a, b) => a.strike - b.strike);

  return completeData;
};
