import { useAppStore } from "@/UI/lib/zustand/store";

import LogoEth from "@/UI/components/Icons/LogoEth";
import ArrowRight from "@/UI/components/Icons/ArrowRight";
import ChevronLeft from "@/UI/components/Icons/ChevronLeft";
import ChevronRight from "@/UI/components/Icons/ChevronRight";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import Add from "@/UI/components/Icons/Add";

import styles from "./InfoPopup.module.scss";
import { formatNumberByCurrency, getNumber } from "@/UI/utils/Numbers";
import Greeks from "../Greeks/Greeks";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

type InfoPopupType = "bonus" | "twinWin" | "risky" | "options";

type CommonProperties = {
  type: InfoPopupType;
};

type BonusTwinWinPopup = CommonProperties & {
  price: string;
  barrier: string;
  strike: string;
};

type RiskyPopup = CommonProperties & {
  price: number;
  risk: string;
  currency: string;
  earn: string;
  showInstructions: boolean;
};

type OptionsPopup = CommonProperties & {
  greeks?: Record<string, number>;
  side?: "BUY" | "SELL";
  callOrPut?: "Call" | "Put";
  showInstructions: boolean;
};

export type InfoPopupProps = BonusTwinWinPopup | RiskyPopup | OptionsPopup;

export const InfoPopup = (props: InfoPopupProps) => {
  const { currentExpiryDate, spotPrices } = useAppStore();
  const spot = spotPrices["WETH/USDC"];

  const { type } = props;

  switch (type) {
    case "bonus": {
      const { barrier, strike, price } = props as BonusTwinWinPopup;
      return (
        <div className={`${styles.popupContainer} ${styles.bonusOrTwinWin}`}>
          <p>
            <span className={styles.popupBuyEth}>Buy</span>
            <LogoEth />
            <span className={styles.lato}>@</span>
            {price}
          </p>
          <p>
            <span className={styles.popupIfEth}>If</span>
            <LogoEth />@
            <span className={styles.italic}>
              {formatDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT)}
            </span>
            <ChevronRight />
            {formatNumberByCurrency(getNumber(barrier), "string", "WETH")} (<ChevronLeft />
            {strike} )<ArrowRight />
            <span className='position-relative'>
              <span>{strike};</span>
              <span className={styles.childLabel}>
                Price
                <br />
                Reference
              </span>
            </span>
          </p>
          <p>
            Else <LogoEth />
          </p>
        </div>
      );
    }
    case "twinWin": {
      const { barrier, strike, price } = props as BonusTwinWinPopup;
      return (
        <div className={`${styles.popupContainer} ${styles.bonusOrTwinWin}`}>
          <p>
            <span className={styles.popupBuyEth}>Buy</span>
            <LogoEth />
            <span className={styles.lato}>@</span>
            {price}
          </p>
          <p>
            <span className={styles.popupIfEth}>If</span>
            <LogoEth />@
            <span className={styles.italic}>
              {formatDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT)}
            </span>
            <ChevronRight />
            {formatNumberByCurrency(getNumber(barrier), "string", "WETH")} (<ChevronLeft />
            {strike} )<ArrowRight />
            <span className='position-relative'>
              <span>{strike}</span>
              <span className={styles.childLabel}>
                Price
                <br />
                Reference
              </span>
            </span>
            + (
            <span className='position-relative'>
              <span>{strike}</span>
              <span className={styles.childLabel}>
                Price
                <br />
                Reference
              </span>
            </span>
            - <LogoEth /> );
          </p>
          <p>
            Else <LogoEth />
          </p>
        </div>
      );
    }
    case "risky": {
      const { risk, earn, currency, price, showInstructions } = props as RiskyPopup;

      const riskEth =
        currency !== "WETH"
          ? formatNumberByCurrency(parseFloat(risk) / spot, "", "WETH")
          : formatNumberByCurrency(Number(risk), "", "WETH");
      const riskUsdc =
        currency !== "USDC"
          ? formatNumberByCurrency(parseFloat(risk) * spot, "", "USDC")
          : formatNumberByCurrency(Number(risk), "", "USDC");

      return (
        <>
          <div
            className={`${styles.popupContainer} ${styles.popupTopContainer} ${styles.riskyEarn1} ${
              showInstructions ? styles.open : styles.closed
            }`}
          >
            <p>
              If <LogoEth /> <ChevronLeft /> {price}, receive {riskEth} <LogoEth /> <Add /> {earn} <LogoUsdc />
            </p>
          </div>
          <div className={`${styles.popupContainer} ${styles.riskyEarn2}`}>
            <p>
              If <LogoEth /> <ChevronRight /> {price}, receive {riskUsdc} <LogoUsdc /> <Add /> {earn} <LogoUsdc />
            </p>
          </div>
        </>
      );
    }
    case "options": {
      const { greeks, side, showInstructions, callOrPut } = props as OptionsPopup;
      return (
        <>
          <div
            className={`${styles.popupContainer} ${styles.popupGreeksContainer} ${
              callOrPut === "Call" ? styles.call : styles.put
            } ${side === "BUY" ? styles.buy : styles.sell} ${showInstructions ? styles.open : styles.closed}`}
          >
            <Greeks greeks={greeks} />
          </div>
        </>
      );
    }
  }
};
