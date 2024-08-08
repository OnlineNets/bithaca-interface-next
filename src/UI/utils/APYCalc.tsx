import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { DEFAULT_INPUT_DATE_FORMAT, readDate } from "./DateFormatting";
dayjs.extend(duration);

export const calculateAPY = (contractExpiry: string, risk: number, earn: number) => {
  if (risk <= 0 || earn <= 0) return "0";
  const current = dayjs();
  const expiry = readDate(contractExpiry, DEFAULT_INPUT_DATE_FORMAT);
  const diff = dayjs.duration(expiry.diff(current)).asYears();
  const apy = (100 * (earn / (risk - 1))) / diff;
  return `${apy.toFixed(1)}`;
};
