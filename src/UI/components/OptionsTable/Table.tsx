import { useEffect, useState } from "react";

import classNames from "classnames";

import { getCurrencyLogo } from "@/UI/utils/Currency";
import { formatNumberByFixedPlaces } from "@/UI/utils/Numbers";
import styles from "@/UI/components/OptionsTable/OptionsTable.module.scss";
import { DEFAULT_INPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
import { OptionsBidAskData, OptionsData, TableProps } from "@/UI/constants/prices";
import { fetchPriceList } from "@/services/pricing/calcPrice.api.service";
import SingleValueCell from "./SingleValueCell";

const Table = ({ type, data, strikes, currency }: TableProps) => {
  const [showingData, setShowingData] = useState<OptionsBidAskData[]>([]);

  useEffect(() => {
    if (!data.length) return;
    const tempData: OptionsData[] = [];
    for (let i = 0; i < strikes.length; i++) {
      const tempDataForStrike = data.reduce((acc: OptionsData | undefined, el: OptionsData) => {
        if (el.economics.strike === strikes[i]) {
          if (!acc || el.referencePrice > acc.referencePrice) {
            return el;
          } else if (el.referencePrice === acc.referencePrice) {
            return el;
          }
        }
        return acc;
      }, undefined);

      if (tempDataForStrike) {
        tempData.push(tempDataForStrike);
      }
    }

    const contracts = tempData.map(el => {
      const date = formatDate(el.economics.expiry.toString(), DEFAULT_INPUT_DATE_FORMAT, "YYYY-MM-DD");

      return {
        contractId: el.contractId,
        payoff: el.payoff,
        expiry: date,
        strike: el.economics.strike,
      };
    });

    fetchPriceList({ contracts }).then(({ data }) => {
      const showingList = tempData.map(el => {
        const newContract = data.find(newContract => newContract.contractId === el.contractId);

        return {
          askVolume: el.askVolume,
          bidVolume: el.bidVolume,
          bestBid: el.bestBid || 0,
          bestAsk: el.bestAsk || 0,
          referencePrice: newContract?.price || 0,
        };
      });

      setShowingData(showingList);
    });
  }, [data, strikes]);

  return (
    <div className={styles.table}>
      <h1>{type.charAt(0).toUpperCase() + type.slice(1)}</h1>
      <div className={`${styles.header} ${styles[type]}`}>
        <div className={styles.cell}>Bid</div>
        <div className={styles.cell}>Model</div>
        <div className={styles.cell}>Ask</div>
      </div>
      {showingData.map((el, index) => {
        return (
          <div
            key={index}
            className={classNames(
              `${styles.row} ${styles[type]} ${index % 2 === 1 && styles.darkRow} ${index === 5 && styles.selectedRow}`,
              "tw-h-[54px]"
            )}
          >
            <SingleValueCell
              textClassName='tw-text-ithaca-green-30'
              value={formatNumberByFixedPlaces(el.bestBid, 3)}
              depthValue={el.bidVolume ? formatNumberByFixedPlaces(el.bidVolume, currency === "USDC" ? 0 : 3) : "-"}
              currencyIcon={getCurrencyLogo(currency)}
            />
            <div className={classNames(styles.cell, "tw-flex tw-flex-col")}>
              <span className='tw-text-ithaca-white-60'>{formatNumberByFixedPlaces(el.referencePrice, 3)}</span>
            </div>
            <SingleValueCell
              textClassName='tw-text-ithaca-red-20'
              value={formatNumberByFixedPlaces(el.bestAsk, 3)}
              depthValue={el.askVolume ? formatNumberByFixedPlaces(el.askVolume, currency === "USDC" ? 0 : 3) : "-"}
              currencyIcon={getCurrencyLogo(currency)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Table;
