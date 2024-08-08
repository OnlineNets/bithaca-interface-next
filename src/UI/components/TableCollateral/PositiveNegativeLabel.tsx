import { formatNumberByCurrency, transformTradingPrice } from "@/UI/utils/Numbers";
import { Currency } from "@/utils/types";
import classNames from "classnames";

interface LabelProps {
  value: number;
  currency?: string;
  showAbsValue?: boolean;
  className?: string;
  labelClassName?: string;
}
const PositiveNegativeLabel = ({ labelClassName, value, currency, showAbsValue = false, className }: LabelProps) => {
  const finalValueToUse = `${value}`.includes("e") ? Number(transformTradingPrice(value)) : value;
  const formattedValue = formatNumberByCurrency(
    Number(finalValueToUse),
    "string",
    currency as Currency,
    undefined,
    true
  );
  if (finalValueToUse === 0) {
    return <p>{formattedValue}</p>;
  }

  const isPositive = finalValueToUse > 0;

  const label = isPositive ? "Pay" : "Receive";

  return (
    <div className={classNames("tw-flex tw-flex-col tw-items-center tw-gap-0.5", className)}>
      <p className={classNames("tw-text-ithaca-white-60", "tw-text-xxs", labelClassName)}>{label}</p>
      <p
        className={classNames("tw-text-base", {
          "tw-text-ithaca-red-20": isPositive,
          "tw-text-ithaca-green-30": !isPositive,
        })}
      >
        {showAbsValue ? Math.abs(finalValueToUse) : formattedValue}
      </p>
    </div>
  );
};

export default PositiveNegativeLabel;
