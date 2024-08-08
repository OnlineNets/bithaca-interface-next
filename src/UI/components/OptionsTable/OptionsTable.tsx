import { useEffect, useState } from "react";

// Components
import Table from "@/UI/components/OptionsTable/Table";

// Constants
import { OptionsData, OptionsTableProps } from "@/UI/constants/prices";

// Utils
import { useAppStore } from "@/UI/lib/zustand/store";

// Styles
import styles from "./OptionsTable.module.scss";
import classNames from "classnames";

const OptionsTable = ({ data, currency }: OptionsTableProps) => {
  const { currentExpiryDate, currentSpotPrice } = useAppStore();
  const [putsData, setPutsData] = useState<OptionsData[]>([]);
  const [callsData, setCallsData] = useState<OptionsData[]>([]);
  const [strikes, setStrikes] = useState<number[]>([]);

  useEffect(() => {
    setPutsData([]);
    setCallsData([]);
  }, [currentExpiryDate]);

  useEffect(() => {
    data.forEach(el => {
      switch (el.payoff) {
        case "Put":
        case "BinaryPut": {
          setPutsData(prevState => [...prevState, el]);
          break;
        }
        case "Call":
        case "BinaryCall":
          setCallsData(prevState => [...prevState, el]);
          break;
      }
    });
  }, [data]);

  useEffect(() => {
    if (data.length) {
      const spotPrice = Math.round(currentSpotPrice / 100) * 100;
      let isStrikeHere = false;
      const generatedStrikes: number[] = [];

      data.forEach(el => {
        if (el.economics.strike === spotPrice) {
          isStrikeHere = true;
        }
      });

      if (isStrikeHere) {
        for (let i = spotPrice - 500; i <= spotPrice + 700; i += 100) {
          generatedStrikes.push(i);
        }
      }

      setStrikes(generatedStrikes);
    }
  }, [currentSpotPrice, data]);

  return (
    <>
      <div className={styles.optionsTable}>
        <Table key='calls' type='calls' data={callsData} strikes={strikes} currency={currency} />
        <div className={styles.strike}>
          <div className={styles.header}>Strikes</div>
          <div className={styles.strikes}>
            {strikes.map((el, index) => (
              <div
                key={index}
                className={classNames(
                  `${styles.cell} ${index % 2 === 1 && styles.darkRow} ${index === 5 && styles.selectedRow}`,
                  "tw-flex tw-h-[54px] tw-items-center tw-justify-center"
                )}
              >
                {el}
              </div>
            ))}
          </div>
        </div>
        <Table key='puts' type='puts' data={putsData} strikes={strikes} currency={currency} />
      </div>
    </>
  );
};

export default OptionsTable;
