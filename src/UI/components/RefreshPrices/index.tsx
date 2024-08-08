import RefreshIcon from "@/assets/icons/refresh.svg";
import classNames from "classnames";
import { useState } from "react";

interface RefreshPricesProps {
  onRefreshPrices?: () => void;
}

const RefreshPrices = ({ onRefreshPrices }: RefreshPricesProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const onClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 3000);
    onRefreshPrices?.();
  };

  // No possibility to refresh prices without function
  if (!onRefreshPrices) return null;

  return (
    <button onClick={onClick} className='tw-flex tw-cursor-pointer tw-flex-row tw-items-center tw-gap-[6px]'>
      <RefreshIcon
        className={classNames({
          "tw-animate-spin": isAnimating,
        })}
      />
      <span className='tw-text-xs tw-text-white'>Refresh prices</span>
    </button>
  );
};

export default RefreshPrices;
