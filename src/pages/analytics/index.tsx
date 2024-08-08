import classNames from "classnames";

import Main from "@/UI/layouts/Main/Main";
import Meta from "@/UI/components/Meta/Meta";
import { useDevice } from "@/UI/hooks/useDevice";
import { Currency } from "@/UI/components/Currency";
import { useAppStore } from "@/UI/lib/zustand/store";
import Container from "@/UI/layouts/Container/Container";
import FundlockValue from "@/UI/components/FundlockSummary";
import ChartMaxPain from "@/UI/components/ChartMaxPain/ChartMaxPain";
import HeaderWithInformation from "@/UI/components/HeaderWithInformation";
import ChartTradeCount from "@/UI/components/ChartTradeCount/ChartTradeCount";
import ChartOpenInterest from "@/UI/components/ChartOpenInterest/ChartOpenInterest";
import ChartTradingVolume from "@/UI/components/ChartTradingVolume/ChartTradingVolume";
import {
  API_DATE_FORMAT,
  DEFAULT_INPUT_DATE_FORMAT,
  DEFAULT_OUTPUT_DATE_FORMAT,
  formatDate,
} from "@/UI/utils/DateFormatting";

import { useData } from "./useData";
import styles from "./analytics.module.scss";

export const PIE_COLORS = [
  "#ff3f57",
  "#A855F7",
  "#B5B5F8",
  "#FF772A",
  "#00836E",
  "#00FFFF",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#800000",
  "#808000",
  "#008080",
  "#800080",
  "#FFA500",
  "#A52A2A",
  "#008000",
  "#000080",
  "#808080",
];

export interface ExpiryList {
  name: string;
  value: string;
  color: string;
}

const Analytics = () => {
  const { expiryList, currentExpiryDate } = useAppStore();

  const device = useDevice();
  const options = expiryList.map((date: number, index: number) => ({
    name: formatDate(`${date}`, DEFAULT_INPUT_DATE_FORMAT, "DDMMMYY"),
    value: formatDate(`${date}`, DEFAULT_INPUT_DATE_FORMAT, API_DATE_FORMAT),
    color: PIE_COLORS[index],
  }));
  const { tradeCount, tradeVolume } = useData();

  return (
    <>
      <Meta />
      <Main>
        <Container className='mb-15'>
          {device === "desktop" && (
            <div className='flex-row space-between items-center mb-17 flex-wrap'>
              <div className='flex-row gap-70'>
                <Currency />
              </div>
              <FundlockValue isAlwaysInline />
            </div>
          )}
          {device === "tablet" && (
            <>
              <div className={classNames("flex-row mb-18", [styles.borderBottom])}>
                <Currency />
                <FundlockValue />
              </div>
            </>
          )}
          {device === "phone" && (
            <>
              <HeaderWithInformation title='Analytics' />
            </>
          )}
          <div className={classNames(styles.chartContainer, styles.wrapDesktop, "mb-15 gap-15")}>
            <div
              className={classNames(
                styles.singleChartPanel,
                "ptb-24 plr-30 desktop-grow mobile-full-width p-tablet-16"
              )}
            >
              <h3 className='mb-18 mb-tablet-16'>Trade Count</h3>
              <ChartTradeCount data={tradeCount} expiryList={options} />
            </div>
            <div
              className={classNames(
                styles.singleChartPanel,
                "ptb-24 plr-30 desktop-grow mobile-full-width p-tablet-16"
              )}
            >
              <h3 className='mb-18'>Trading Volumes</h3>
              <ChartTradingVolume data={tradeVolume} expiryList={options} />
            </div>
          </div>

          <div className={classNames(styles.chartContainer, styles.wrapDesktop, "mb-15 gap-15")}>
            <div
              className={classNames(
                styles.singleChartPanel,
                "ptb-24 plr-30 desktop-grow mobile-full-width p-tablet-16",
                styles.maxPainWidth
              )}
            >
              <h3 className='mb-18'>
                Max Pain{" "}
                <span className={styles.expirySubHeader}>
                  ({formatDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT)})
                </span>
              </h3>
              <ChartMaxPain />
            </div>
            <div
              className={classNames(
                styles.singleChartPanel,
                "ptb-24 plr-30 desktop-grow mobile-full-width p-tablet-16"
              )}
            >
              <h3 className='mb-18'>
                Open Interest{" "}
                <span className={styles.expirySubHeader}>
                  ({formatDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT)})
                </span>
              </h3>
              <ChartOpenInterest />
            </div>
          </div>
        </Container>
      </Main>
    </>
  );
};

export default Analytics;
