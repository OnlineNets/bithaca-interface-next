import Main from "@/UI/layouts/Main/Main";
import Meta from "@/UI/components/Meta/Meta";
import Container from "@/UI/layouts/Container/Container";

import styles from "./calculator.module.scss";
import { ChangeEvent, useMemo, useState } from "react";
import Panel from "@/UI/layouts/Panel/Panel";
import { CalculatorInputRow } from "@/UI/components/CalculatorRow/CalculatorInputRow";

import CalculatorHeaderImage from "@/assets/calculator_banner.png";
import Image from "next/image";
import Button from "@/UI/components/Button/Button";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";

const resultTooltip = `Fraction of bankroll to wager = WAGMI probability - ( 1 - WAGMI ) / offered odds
Example if WAGMI = 20% and you expect 10x return on success, 
Optimal exposure = 20% - 80% / 9 =. ~ 11%`;

const odsDescription = `Memecoin speculation constitutes a binary bet.
Losing the bet, entails total loss.
What is the proportion of the bet gained with a win?
If chosen memecoin catches on; what is multiple you expect to make from here on?
Enter your expected net odds:
For example,
9, if you expect to make 10x your invested amount
3, if you expect to make 4x your invested amount
( You bet 10$ on offered odds 3:1, you win 30$ for 10$ bet, so you returned 40$, ie. 4x )`;

const bankrollDescription =
  "Total Wealth. Kelly bet size maximizes expected geometric wealth growth rate; maximizing total wealth in the long run, while ensuring survival";

const Analytics = () => {
  const [bankroll, setBankroll] = useState(1000);
  const [odds, setOdds] = useState(2);
  const [probability, setProbability] = useState(50);
  const [kellyCriterion, setKellyCriterion] = useState(1);
  const [optimalExposure, setOptimalExposure] = useState(NaN);

  const calculateOptimalExposure = () => {
    const probabilityDecimal = probability / 100;
    let optimalExposure = bankroll * kellyCriterion * ((probabilityDecimal * odds - (1 - probabilityDecimal)) / odds);
    if (optimalExposure < 0) {
      optimalExposure = 0;
    }
    setOptimalExposure(optimalExposure);
  };

  const resetForm = () => {
    setBankroll(1000);
    setOdds(2);
    setProbability(50);
    setKellyCriterion(1);
    setOptimalExposure(NaN);
  };

  const inputFields = useMemo(
    () => [
      {
        label: "Bankroll / Total @ Risk",
        description: bankrollDescription,
        value: bankroll,
        icon: <LogoUsdc />,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setBankroll(Number(e.target.value)),
      },
      {
        label: "Odds on Offer X:1",
        description: odsDescription,
        value: odds,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setOdds(Number(e.target.value)),
      },
      {
        label: "WAGMI Probability",
        description:
          "Enter your subjective probability of winning this bet. You are supposed to bet if you believe in your edge; ie your subjective probability implies better odds than the your expected market outcome ( be careful here: by definition, if you think market could go up 10x if the memecoin catches on, should imply that there is a 10% probability of success, ‘objectively’ assessing higher probability of success implies either risk loving or better information, ie, your view on relative community strength and backing )",
        value: probability,
        formater: (value: number) => `${value}%`,
        type: "text",
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          let prob = parseFloat(e.target.value.replace(/%/g, ""));
          if (prob > 100) {
            prob = 100;
          }
          if (prob < 0) {
            prob = 0;
          }

          setProbability(prob);
        },
      },
      /*{
        label: "Kelly Criterion",
        description:
          "Enter Your 'Kelly Adjustment' to divide. '1' for full, '.5' for Half-Kelly, '.25' for Quarter-Kelly, etc.",
        value: kellyCriterion,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setKellyCriterion(Number(e.target.value)),
      },*/
    ],
    [bankroll, odds, probability, kellyCriterion]
  );

  return (
    <>
      <Meta />
      <Main>
        <Container className='mb-15'>
          <div className={`${styles.wrapper} mb-12`}>
            <div className={styles.imageContainer}>
              <Image src={CalculatorHeaderImage} alt='Header' className={styles.image} />
            </div>
            <Panel margin={styles.mainPanel}>
              <div className={styles.wrapper}>
                <h1>Fortune&apos;s Formula</h1>
                <h2>Kelly Criterion</h2>
              </div>
              <div className={styles.header}>
                <p>Input Data</p>
                <p className={styles.valueHeader}>Values</p>
              </div>
              <div className={`${styles.verticalDivider} mb-20`}></div>
              <div className={`${styles.inputContainer} input-container`}>
                {inputFields.map((field, index) => {
                  let value = "";
                  if (!isNaN(field.value)) {
                    value = field.formater ? field.formater(field.value) : field.value?.toString();
                  }
                  return (
                    <CalculatorInputRow
                      inputIcon={field.icon}
                      key={index}
                      type={(field?.type as "number" | "text") || "number"}
                      label={field.label}
                      description={field.description}
                      value={value}
                      onChange={field.onChange}
                    />
                  );
                })}
              </div>
              <div className={styles.verticalDivider}></div>
              <div className={styles.result}>
                <div className={styles.resultLabel}>
                  <p className='mb-10'>Optimal Exposure</p>
                  <p className={styles.description}>{resultTooltip}</p>
                </div>
                {!isNaN(optimalExposure) && (
                  <div className={styles.resultValue}>
                    <p className='mr-2'>{optimalExposure.toFixed(2)}</p>
                    <LogoUsdc />
                  </div>
                )}
              </div>
              <div className={styles.buttons}>
                <Button className={styles.resetButton} onClick={resetForm} title='Reset'>
                  Reset
                </Button>
                <Button className={styles.calculateButton} onClick={calculateOptimalExposure} title='Calculate'>
                  Calculate
                </Button>
              </div>
            </Panel>
          </div>
        </Container>
      </Main>
    </>
  );
};

export default Analytics;
