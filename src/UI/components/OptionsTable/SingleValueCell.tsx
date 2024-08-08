import { ReactNode } from "react";
import classNames from "classnames";
interface SingleValueCellProps {
  depthValue: string;
  currencyIcon: ReactNode;
  value?: number | string;
  textClassName?: string;
  className?: string;
}

const SingleValueCell = ({ value, depthValue, currencyIcon, textClassName, className }: SingleValueCellProps) => {
  return (
    <div
      className={classNames(
        "tw-flex tw-w-1/3 tw-flex-col tw-gap-1 tw-overflow-hidden tw-overflow-ellipsis tw-whitespace-nowrap tw-text-center tw-font-roboto tw-text-sm tw-font-normal",
        className
      )}
    >
      <span className={classNames("tw-flex tw-items-center tw-justify-center", textClassName)}>{value}</span>
      <span className='tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-[2px] tw-text-[10px] tw-text-ithaca-white-60'>
        {depthValue}
        {currencyIcon}
      </span>
    </div>
  );
};

export default SingleValueCell;
