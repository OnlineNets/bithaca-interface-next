import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UTC from "dayjs/plugin/utc";
dayjs.extend(customParseFormat);
dayjs.extend(UTC);

export const formatDate = (date: string | number, inputFormat: string | undefined, outputFormat: string) => {
  return readDate(date, inputFormat).format(outputFormat);
};

export const readDate = (date: string | number, format: string | undefined) => {
  return dayjs(date, format);
};

export const readDateUTC = (date: string | number, format: string | undefined) => {
  return dayjs.utc(date, format);
};

export const DEFAULT_OUTPUT_DATE_FORMAT = "DMMMYY";

export const DEFAULT_INPUT_DATE_FORMAT = "YYMMDDHHm";

export const API_DATE_FORMAT = "YYYY-MM-DD";
