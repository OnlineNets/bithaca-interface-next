// Packages
import React, { useEffect, useMemo, useState } from "react";
import { TradingStoriesProps } from "..";
import { AuctionSubmission } from "@/pages/trading/position-builder";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import Slider from "@/UI/components/Slider/Slider";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import LogoEth from "@/UI/components/Icons/LogoEth";
import Input from "@/UI/components/Input/Input";
import LabeledInput from "@/UI/components/LabeledInput/LabeledInput";
import Toast from "@/UI/components/Toast/Toast";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";

// Utils
import { getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { ClientConditionalOrder, createClientOrderId, toPrecision } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";
import RiskyEarnInstructions from "../../Instructions/RiskyEarnInstructions";
import RisklessEarnInstructions from "../../Instructions/RisklessEarnInstructions";
import RadioButton from "../../RadioButton/RadioButton";
import { RISKY_RISKLESS_EARN_OPTIONS } from "@/UI/constants/options";
import styles from "./Earn.module.scss";
import { calculateAPY } from "@/UI/utils/APYCalc";
import { DESCRIPTION_OPTIONS, TITLE_OPTIONS } from "@/UI/constants/tabCard";

//Styles
import radioButtonStyles from "@/UI/components/RadioButton/RadioButton.module.scss";
import { MOBILE_BREAKPOINT } from "@/UI/constants/breakpoints";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { usePrice } from "@/services/pricing/usePrice";
import { OrderSummaryType } from "@/types/orderSummary";
import classNames from "classnames";
import { useForwardPrice, useNextForwardAuction } from "@/services/pricing/useForwardPrices";
import { DEFAULT_INPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

const Earn = ({ showInstructions, compact, chartHeight, radioChosen, onRadioChange }: TradingStoriesProps) => {
  const { currentSpotPrice, currencyPrecision, currentExpiryDate, ithacaSDK, getContractsByPayoff, spotContract } =
    useAppStore();

  const isRisklessEarn = radioChosen === "Riskless Earn";

  // Next forward price
  const { data: nextForwardPriceData } = useNextForwardAuction();
  const nextForwardPrice = nextForwardPriceData?.data;

  // Selected expiry
  const currentExpiryDateFormatted = formatDate(currentExpiryDate.toString(), DEFAULT_INPUT_DATE_FORMAT, "YYYY-MM-DD");
  const { data: selectedExpiryPriceData } = useForwardPrice({ date: currentExpiryDateFormatted });
  const selectedExpiryPrice = selectedExpiryPriceData?.data;

  const callContracts = getContractsByPayoff("Call");
  const putContracts = getContractsByPayoff("Put");
  const nextAuctionForwardContract = spotContract;
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [currency, setCurrency] = useState("WETH");
  const [riskyOrRiskless, setRiskyOrRiskless] = useState<"Risky Earn" | "Riskless Earn">("Risky Earn");

  const strikes = useMemo(() => {
    return callContracts
      ? Object.keys(callContracts).reduce<number[]>((strikeArr, currStrike) => {
          const strike = parseFloat(currStrike);
          const isValidStrike = currency === "WETH" ? strike > currentSpotPrice : strike < currentSpotPrice;
          if (isValidStrike) strikeArr.push(strike);
          return strikeArr;
        }, [])
      : [];
  }, [callContracts, currency]);

  const [strike, setStrike] = useState({
    min: strikes[0],
    max: strikes[Math.ceil(strikes.length / 2) - 1],
  });

  useEffect(() => {
    setStrike({
      min: strikes[0],
      max: strikes[Math.ceil(strikes.length / 2) - 1],
    });
  }, [strikes]);

  const [capitalAtRisk, setCapitalAtRisk] = useState("");
  const [targetEarn, setTargetEarn] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);

  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();

  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();

  const handleRiskyRisklessChange = (option: "Risky Earn" | "Riskless Earn") => {
    setRiskyOrRiskless(option);
    if (onRadioChange) onRadioChange(DESCRIPTION_OPTIONS[option], TITLE_OPTIONS[option]);
  };

  const { unitPrice: remoteUnitPriceReference } = usePrice({
    isForward: false,
    optionType: currency === "WETH" ? "Call" : "Put",
    expiryDate: currentExpiryDate,
    strike: `${strike.max}`,
    side: "SELL",
  });

  useEffect(() => {
    if (isRisklessEarn) {
      if (selectedExpiryPrice && nextForwardPrice) {
        const calculatedTargetEarn = Number(capitalAtRisk) * (selectedExpiryPrice / nextForwardPrice - 1);
        setTargetEarn(`${calculatedTargetEarn.toFixed(2)}`);
      }
    } else {
      const calculatedTargetEarn = Number(remoteUnitPriceReference) * Number(capitalAtRisk);
      setTargetEarn(calculatedTargetEarn.toFixed(2));
    }
  }, [
    currentExpiryDate,
    strike,
    currency,
    remoteUnitPriceReference,
    radioChosen,
    capitalAtRisk,
    selectedExpiryPrice,
    nextForwardPrice,
  ]);

  useEffect(() => {
    if ((!compact && radioChosen === "Risky Earn") || (compact && riskyOrRiskless === "Risky Earn")) {
      handleRiskyChange(strike, currency, capitalAtRisk, targetEarn);
    } else {
      handleRisklessChange(capitalAtRisk, targetEarn);
    }
  }, [capitalAtRisk, targetEarn, strike, currency, radioChosen, riskyOrRiskless]);

  const handleCapitalAtRiskChange = async (amount: string) => {
    const capitalAtRisk = getNumberValue(amount);
    setCapitalAtRisk(capitalAtRisk);
  };

  const handleRisklessChange = async (risk: string, earn: string) => {
    if (isInvalidNumber(getNumber(earn)) || isInvalidNumber(getNumber(risk))) return;
    const closest = Object.keys(callContracts)
      .filter(contract => Number(contract) > currentSpotPrice)
      .sort()[0];

    const legs = [
      {
        contractId: nextAuctionForwardContract?.contractId,
        quantity: capitalAtRisk,
        side: "BUY",
      },
      {
        contractId: callContracts[closest].contractId,
        quantity: capitalAtRisk,
        side: "SELL",
      },
      {
        contractId: putContracts[closest].contractId,
        quantity: capitalAtRisk,
        side: "BUY",
      },
    ];

    const order = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: getNumber((Number(earn) - Number(risk)).toString()).toFixed(currencyPrecision.strike),
      legs,
      addCollateral: currency === "WETH",
    } as ClientConditionalOrder;

    const payoffMap = [];
    for (let i = 0; i < 1000; i++) {
      payoffMap.push({
        x: i + 1600,
        total: i + 40000,
      });
    }
    setPayoffMap(payoffMap);

    try {
      const orderLock = await ithacaSDK.calculation.estimateOrderLockPositioned(order);
      const orderFees = await ithacaSDK.calculation.estimateOrderFees(order);
      setOrderDetails({
        order,
        orderLock,
        orderFees,
      });
    } catch (error) {
      // Add toast
      console.error("Order estimation for earn failed", error);
    }
  };

  const handleRiskyChange = async (
    strike: { min: number; max: number },
    currency: string,
    capitalAtRisk: string,
    targetEarn: string
  ) => {
    if (isInvalidNumber(getNumber(targetEarn)) || isInvalidNumber(getNumber(capitalAtRisk))) {
      setOrderDetails(undefined);
      setPayoffMap(undefined);
      return;
    }
    const contract = currency === "WETH" ? callContracts[strike.max] : putContracts[strike.max];

    const quantity =
      currency === "WETH"
        ? `${capitalAtRisk}`
        : `${toPrecision(getNumber(capitalAtRisk) / strike.max, currencyPrecision.strike)}`;
    const legs = [
      {
        contractId: contract.contractId,
        quantity: quantity,
        side: "SELL",
      },
    ];

    const order = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: (-getNumber(targetEarn)).toFixed(currencyPrecision.strike),
      legs: legs,
      addCollateral: currency === "WETH",
    } as ClientConditionalOrder;

    const strikeDiff = (strikes[strikes.length - 1] - strikes[0]) / 7 / 4;

    const payOffQuantity =
      currency === "WETH"
        ? `${capitalAtRisk}`
        : `${toPrecision(getNumber(capitalAtRisk) / strike.max, currencyPrecision.strike)}`;

    const payOffLeg = {
      contractId: putContracts[strike.max].contractId,
      quantity: payOffQuantity,
      side: "SELL",
    };

    const payoffMap = estimateOrderPayoff(
      [
        {
          ...putContracts[strike.max],
          ...payOffLeg,
          premium: getNumber(targetEarn) - getNumber(capitalAtRisk),
          quantity: "1",
        },
      ],
      {
        min: strikes[0],
        max: strikes[strikes.length - 1] + strikeDiff,
      }
    );
    setPayoffMap(payoffMap);

    try {
      const [orderLock, orderFees] = await Promise.all([
        ithacaSDK.calculation.estimateOrderLockPositioned(order),
        ithacaSDK.calculation.estimateOrderFees(order),
      ]);

      setOrderDetails({
        order,
        orderLock,
        orderFees,
      });
    } catch (error) {
      setOrderDetails({
        order,
        orderLock: null,
        orderFees: null,
      });
      console.error("Order estimation for earn failed", error);
    }
  };

  const handleSubmit = async () => {
    if (!orderDetails) return;

    setAuctionSubmission({
      order: orderDetails?.order,
      type: riskyOrRiskless,
    });
    setSubmitModal(true);
  };

  const submitToAuction = async (order: ClientConditionalOrder, orderDescr: string) => {
    try {
      await ithacaSDK.orders.newOrder(order, orderDescr);
      showOrderConfirmationToast();
    } catch (error) {
      showOrderErrorToast();
      console.error("Failed to submit order", error);
    }
  };

  const getAPY = () => {
    if (isInvalidNumber(getNumber(capitalAtRisk)) || isInvalidNumber(getNumber(targetEarn))) {
      return <span>-%</span>;
    }

    const risk = currency === "WETH" ? getNumber(capitalAtRisk) * currentSpotPrice : getNumber(capitalAtRisk);
    const apy = calculateAPY(`${callContracts[strike.max].economics.expiry}`, risk, getNumber(targetEarn));
    return `${apy}%`;
  };

  useEffect(() => {
    handleCapitalAtRiskChange("1");
  }, [currentExpiryDate]);

  return (
    <>
      {!compact &&
        showInstructions &&
        (radioChosen === "Risky Earn" ? (
          <RiskyEarnInstructions currentExpiryDate={currentExpiryDate.toString()} />
        ) : (
          <RisklessEarnInstructions currentExpiry={currentExpiryDate.toString()} />
        ))}

      {compact && (
        <Flex margin='mb-24 z-max'>
          <RadioButton
            labelClassName={radioButtonStyles.microLabels}
            size={compact ? "compact" : "regular"}
            width={186}
            options={RISKY_RISKLESS_EARN_OPTIONS}
            selectedOption={riskyOrRiskless}
            name={compact ? "riskyOrRisklessCompact" : "riskyOrRiskless"}
            onChange={value => handleRiskyRisklessChange(value as "Risky Earn" | "Riskless Earn")}
            radioButtonClassName={styles.earnRadioButtonClassName}
          />
        </Flex>
      )}

      {!compact && radioChosen === "Risky Earn" && (
        <h3 className='mbi-16 flex-row gap-4 fs-lato-md mb-12 mt-16'>
          Select Target Price <LogoEth />
        </h3>
      )}
      {radioChosen === "Risky Earn" ? (
        <Flex margin='special-slider mb-7'>
          <Slider
            value={strike}
            extended={!compact}
            min={strikes[0]}
            lockFirst={true}
            max={strikes[strikes.length - 1]}
            label={strikes.length}
            step={100}
            showLabel={!compact}
            onChange={strike => {
              setStrike(strike);
            }}
          />
        </Flex>
      ) : (
        ""
      )}

      {!compact && radioChosen === "Risky Earn" && (
        <Flex
          classes={classNames({
            "flex-column gap-0": isMobile,
            "flex-row-overwrite gap-10": !isMobile,
          })}
        >
          <LabeledInput label='Risk' lowerLabel='Capital At Risk' labelClassName='ml-40'>
            <Input
              type='number'
              width={isMobile ? 125 : 110}
              value={capitalAtRisk}
              onChange={({ target }) => handleCapitalAtRiskChange(target.value)}
              icon={currency === "WETH" ? <LogoEth /> : <LogoUsdc />}
              hasDropdown={true}
              onDropdownChange={option => {
                if (option !== currency) {
                  setCurrency(option);
                  setCapitalAtRisk(option === "USDC" ? "1000" : "1");
                }
              }}
              dropDownOptions={[
                {
                  label: "USDC",
                  value: "USDC",
                  icon: <LogoUsdc />,
                },
                {
                  label: "WETH",
                  value: "WETH",
                  icon: <LogoEth />,
                },
              ]}
            />
          </LabeledInput>
          <div
            className={classNames("flex-row gap-24", {
              "mb-12": !isMobile,
            })}
          >
            <div className='color-white mt-10 mb-12'>
              <Flex classes='items-center'>
                <span className='fs-xs color-white-60'>Earn </span>
                <span className='ml-6 mr-2 fs-md-bold'>{targetEarn}</span>
                <LogoUsdc />
              </Flex>
            </div>
            <div className='color-white mt-10 mb-12'>
              <Flex classes='items-center'>
                <span className='fs-xs color-white-60'>Expected APR </span>
                <span className='ml-6 '>{getAPY()}</span>
              </Flex>
            </div>
          </div>
        </Flex>
      )}

      {!compact && isRisklessEarn && (
        <Flex
          classes={classNames({
            "flex-column gap-0": isMobile,
            "flex-row-overwrite gap-10": !isMobile,
          })}
        >
          <LabeledInput label='Qty' lowerLabel='Loan' labelClassName='ml-40'>
            <Input
              type='number'
              width={80}
              value={capitalAtRisk}
              onChange={({ target }) => handleCapitalAtRiskChange(target.value)}
              icon={<LogoUsdc />}
            />
          </LabeledInput>
          <div
            className={classNames("flex-row gap-24", {
              "mb-12": !isMobile,
            })}
          >
            <div className='color-white mt-10 mb-10'>
              <Flex classes='items-center'>
                <span className='fs-xs color-white-60'>Earn </span>
                <span className='ml-6 mr-2'>{targetEarn}</span>
                <LogoUsdc />
              </Flex>
            </div>
            <div className='color-white mt-10 mb-10'>
              <Flex classes='items-center'>
                <span className='fs-xs color-white-60'>Expected APR </span>
                <span className='ml-6 '>{getAPY()}</span>
              </Flex>
            </div>
          </div>
        </Flex>
      )}
      <ChartPayoff
        // id='earn-chart'
        id={`earn-chart${compact ? "-compact" : ""}`}
        compact={compact}
        // chartData={((!compact && radioChosen === 'Risky Earn') ||(compact && riskyOrRiskless === 'Risky Earn')) && payoffMap ? payoffMap : CHART_FAKE_DATA}
        chartData={payoffMap ?? CHART_FAKE_DATA}
        height={!compact && isRisklessEarn ? (showInstructions ? 106 : 369) : chartHeight}
        showKeys={false}
        customReadout={
          isRisklessEarn
            ? {
                label: "APR",
                value: getAPY(),
              }
            : undefined
        }
        showPortial={radioChosen === "Risky Earn" && payoffMap !== undefined}
        infoPopup={
          radioChosen !== "Riskless Earn" && payoffMap !== undefined
            ? {
                type: "risky",
                price: strike.max,
                risk: capitalAtRisk,
                currency: currency,
                earn: targetEarn,
                showInstructions,
              }
            : undefined
        }
        customDomain={
          (!compact && isRisklessEarn) || (compact && riskyOrRiskless === "Riskless Earn")
            ? {
                min: 0,
                max: 80000,
              }
            : undefined
        }
      />
      {orderDetails && (
        <SubmitModal
          isOpen={submitModal}
          closeModal={val => setSubmitModal(val)}
          submitOrder={() => {
            if (!auctionSubmission) return;
            submitToAuction(auctionSubmission.order, auctionSubmission.type);
            setAuctionSubmission(undefined);
            setSubmitModal(false);
          }}
          auctionSubmission={auctionSubmission}
          positionBuilderStrategies={[]}
          orderSummary={orderDetails}
        />
      )}

      {!compact && (
        <OrderSummary
          isSubmitButtonDisabled={isRisklessEarn && Number(targetEarn) === 0}
          onlyProtiftableOrders={true}
          asContainer={false}
          orderSummary={orderDetails}
          submitAuction={handleSubmit}
        />
      )}

      <Toast toastList={toastList} position={position} />
    </>
  );
};

export default Earn;
