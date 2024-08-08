import cn from "classnames";
// Constants
import { ForwardTableData } from "@/UI/constants/prices";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

// Styles
import styles from "./ForwardsTable.module.scss";
import SingleValueCell from "../OptionsTable/SingleValueCell";
import LogoEth from "../Icons/LogoEth";
import { formatNumberByFixedPlaces } from "@/UI/utils/Numbers";
const Table = ({ index, data }: ForwardTableData) => {
  const formattedDate = formatDate(`${data.economics.expiry}`, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
  const { bestBid, bestAsk, lastPrice, askVolume, bidVolume } = data;

  const bidAskTablePart = () => (
    <div className={styles.table}>
      <h1>{index === 0 ? "Next Auction" : formattedDate}</h1>
      <div className={styles.header}>
        <div className={styles.cell}>Bid</div>
        <div className={styles.cell}>Ask</div>
      </div>
      <div
        className={cn(
          styles.row,
          {
            [styles.darkRow]: index % 2 === 0 && index !== 0,
          },
          "tw-h-[54px]"
        )}
      >
        <SingleValueCell
          className='!tw-w-1/2'
          textClassName='tw-text-ithaca-green-30'
          value={bestBid ? formatNumberByFixedPlaces(bestBid, 1) : "-"}
          depthValue={bidVolume ? formatNumberByFixedPlaces(bidVolume, 3) : "-"}
          currencyIcon={<LogoEth />}
        />
        <SingleValueCell
          className='!tw-w-1/2'
          textClassName='tw-text-ithaca-red-20'
          value={bestAsk ? formatNumberByFixedPlaces(bestAsk, 1) : "-"}
          depthValue={askVolume ? formatNumberByFixedPlaces(askVolume, 3) : "-"}
          currencyIcon={<LogoEth />}
        />
      </div>
    </div>
  );

  const lastAuctionPrice = () => (
    <div className={styles.lastPrice}>
      <div className={styles.header}>Last Auction Price</div>
      <div className={cn(styles.cell, "tw-flex tw-h-[54px] tw-items-center tw-justify-center")}>
        {lastPrice.toFixed(2)}
      </div>
    </div>
  );

  if (index === 0) {
    return (
      <div className={styles.tableWithAuctionPrice}>
        {bidAskTablePart()}
        {lastAuctionPrice()}
      </div>
    );
  }

  return bidAskTablePart();
};
export default Table;
