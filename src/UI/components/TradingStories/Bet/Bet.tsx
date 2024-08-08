/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import React, { useEffect, useState } from "react";
import { TradingStoriesProps } from "..";
import { PositionBuilderStrategy, AuctionSubmission } from "@/pages/trading/position-builder";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import Slider from "@/UI/components/Slider/Slider";
import Input from "@/UI/components/Input/Input";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import BetInstructions from "@/UI/components/Instructions/BetInstructions";
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import LabeledInput from "@/UI/components/LabeledInput/LabeledInput";
import Toast from "@/UI/components/Toast/Toast";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";

// Utils
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";
import { getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";
import { BET_OPTIONS } from "@/UI/constants/options";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { ClientConditionalOrder, Leg, createClientOrderId } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";

//Styles
import radioButtonStyles from "@/UI/components/RadioButton/RadioButton.module.scss";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { MOBILE_BREAKPOINT } from "@/UI/constants/breakpoints";
import { usePrice } from "@/services/pricing/usePrice";
import { OrderSummaryType } from "@/types/orderSummary";
import classNames from "classnames";

const Bet = ({ showInstructions, compact, chartHeight }: TradingStoriesProps) => {
  const {
    currentSpotPrice,
    currencyPrecision,
    currentExpiryDate,
    ithacaSDK,
    getContractsByPayoff,
    unFilteredContractList,
  } = useAppStore();

  const binaryPutContracts = getContractsByPayoff("BinaryPut");
  const binaryCallContracts = getContractsByPayoff("BinaryCall");
  const strikes = binaryPutContracts ? Object.keys(binaryPutContracts).map(strike => parseFloat(strike)) : [];
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [insideOrOutside, setInsideOrOutside] = useState<"INSIDE" | "OUTSIDE">("INSIDE");
  const nearest = Math.round(currentSpotPrice / 100) * 100;
  const [strike, setStrike] = useState({
    min: strikes
      .filter(contract => Number(contract) < nearest)
      .sort()
      .reverse()[0],
    max: strikes.filter(contract => Number(contract) > nearest).sort()[0],
  });
  const [capitalAtRisk, setCapitalAtRisk] = useState("");
  const [targetEarn, setTargetEarn] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();

  const handleBetTypeChange = (betType: "INSIDE" | "OUTSIDE") => {
    setInsideOrOutside(betType);
    calcTargetEarn(capitalAtRisk);
  };

  const handleCapitalAtRiskChange = (amount: string) => {
    const capitalAtRisk = getNumberValue(amount);
    setCapitalAtRisk(capitalAtRisk);
  };

  useEffect(() => {
    handleStrikeChange(strike, insideOrOutside === "INSIDE", getNumber(capitalAtRisk), getNumber(targetEarn));
  }, [capitalAtRisk, strike, insideOrOutside, targetEarn]);

  const handleTargetEarnChange = async (amount: string) => {
    const targetEarn = getNumberValue(amount);
    setTargetEarn(targetEarn);
  };

  const handleStrikeChange = async (
    strike: { min: number; max: number },
    inRange: boolean,
    capitalAtRisk: number,
    targetEarn: number
  ) => {
    if (isInvalidNumber(capitalAtRisk) || isInvalidNumber(targetEarn)) {
      setOrderDetails(undefined);
      setPayoffMap(undefined);
      return;
    }

    const isBelowSpot = strike.min < currentSpotPrice && strike.max < currentSpotPrice;

    const minContract = !inRange
      ? binaryPutContracts[strike.min]
      : isBelowSpot
        ? binaryPutContracts[strike.max]
        : binaryCallContracts[strike.min];
    const maxContract = !inRange
      ? binaryCallContracts[strike.max]
      : isBelowSpot
        ? binaryPutContracts[strike.min]
        : binaryCallContracts[strike.max];

    // const minContract = binaryCallContracts[strike.min]
    // const maxContract = binaryCallContracts[strike.max]

    // const quantity = `${capitalAtRisk}` as `${number}`;

    // if inside - buy low strike and sell high strike
    // if outside - sell low strike and buy high strike
    const quantity = `${targetEarn}` as `${number}`;
    let legMin: Leg = {
      contractId: minContract.contractId,
      quantity,
      // Set this to buy to make the graph correct
      side: "BUY",
    };
    let legMax: Leg = {
      contractId: maxContract.contractId,
      quantity,
      side: inRange ? "SELL" : "BUY",
    };

    legMin = { ...legMin, quantity };
    legMax = { ...legMax, quantity };

    const order = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: capitalAtRisk.toFixed(currencyPrecision.strike),
      legs: [legMin, legMax],
    } as ClientConditionalOrder;

    const strikeDiff = (strikes[strikes.length - 1] - strikes[0]) / 7 / 4;
    const payoffMap = estimateOrderPayoff(
      [
        { ...minContract, ...legMin, premium: capitalAtRisk / targetEarn },
        { ...maxContract, ...legMax, premium: 0 },
      ],
      {
        min: strikes[0] - strikeDiff,
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
      console.error("Order estimation for bet failed", error);
    }
  };

  const handleSubmit = async () => {
    if (!orderDetails) return;
    const newPositionBuilderStrategies = orderDetails.order.legs.map(leg => {
      const contract = unFilteredContractList.find(contract => contract.contractId == leg.contractId);
      if (!contract) throw new Error(`Contract not found for leg with contractId ${leg.contractId}`);

      return {
        leg: leg,
        strike: contract.economics.strike,
        payoff: contract.payoff,
        // referencePrice: contract.economics.strike,
      } as unknown as PositionBuilderStrategy;
    });

    setAuctionSubmission({
      order: orderDetails?.order,
      type: insideOrOutside === "INSIDE" ? "Inside Bet" : "Outside Bet",
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

  const inRange = insideOrOutside === "INSIDE";
  // If inside BUY Binarycall strike.min
  // If outside BUY binary put, strike.min
  const { unitPrice: binaryCallOrPutPriceReferenceMinStrike } = usePrice({
    isForward: false,
    optionType: inRange ? "BinaryCall" : "BinaryPut",
    expiryDate: currentExpiryDate,
    strike: `${strike.min}`,
    side: "BUY",
  });

  // If inside SELL binaryCall, strike max
  // If outside BUY binarycall, strike.max
  const { unitPrice: binaryCallPriceReferenceMaxStrike } = usePrice({
    isForward: false,
    optionType: "BinaryCall",
    expiryDate: currentExpiryDate,
    strike: `${strike.max}`,
    side: inRange ? "SELL" : "BUY",
  });

  useEffect(() => {
    calcTargetEarn(capitalAtRisk);
  }, [binaryCallOrPutPriceReferenceMinStrike, binaryCallPriceReferenceMaxStrike, capitalAtRisk]);

  useEffect(() => {
    if (isInvalidNumber(Number(capitalAtRisk))) {
      const initialAmount = "100";
      handleCapitalAtRiskChange(initialAmount);
      calcTargetEarn(initialAmount);
    } else {
      calcTargetEarn(capitalAtRisk);
    }
  }, [currentExpiryDate]);

  const calcTargetEarn = (capitalAtRisk: string) => {
    const side = inRange ? -1 : 1;
    const netPrice =
      getNumber(binaryCallOrPutPriceReferenceMinStrike) + side * getNumber(binaryCallPriceReferenceMaxStrike);
    handleTargetEarnChange((Number(capitalAtRisk) / netPrice).toFixed(0));
  };

  const calcOfferedOdds = () => {
    return `${(1 + (getNumber(targetEarn) - getNumber(capitalAtRisk)) / getNumber(capitalAtRisk)).toFixed(2)}:1`;
  };

  useEffect(() => {
    renderInstruction();
  }, [insideOrOutside]);

  const renderInstruction = () => {
    return (
      <>
        {!compact && showInstructions && (
          <BetInstructions type={insideOrOutside} currentExpiryDate={currentExpiryDate.toString()} />
        )}
      </>
    );
  };

  return (
    <>
      {renderInstruction()}

      {/* {compact && (
        <Flex margin='mb-7'>
          <Slider
            value={strike}
            min={strikes[0]}
            max={strikes[strikes.length - 1]}
            label={strikes.length}
            step={100}
            showLabel={false}
            onChange={strike => {
              setStrike(strike);
              // handleStrikeChange(strike, insideOrOutside === 'INSIDE', getNumber(capitalAtRisk));
            }}
            range
          />
        </Flex>
      )} */}

      <Flex margin={`${compact ? "mb-24" : "mt-10 mb-24"}`}>
        <RadioButton
          labelClassName={radioButtonStyles.microLabels}
          size={compact ? "compact" : "regular"}
          width={compact ? 186 : 221}
          options={BET_OPTIONS}
          selectedOption={insideOrOutside}
          name={compact ? "insideOrOutsideCompact" : "insideOrOutside"}
          onChange={betType => handleBetTypeChange(betType as "INSIDE" | "OUTSIDE")}
        />
      </Flex>

      {!compact && (
        <Slider
          value={strike}
          extended={true}
          min={strikes[0]}
          max={strikes[strikes.length - 1]}
          label={strikes.length}
          step={100}
          onChange={strike => setStrike(strike)}
          range
        />
      )}

      {!compact && (
        <Flex
          classes={classNames("items-center mt-13 mb-17", {
            "gap-5": isMobile,
            "gap-24": !isMobile,
          })}
        >
          <LabeledInput label='Bet' lowerLabel='Capital At Risk' wrapperClassName='flex-row-overwrite'>
            <Input
              type='number'
              value={capitalAtRisk}
              width={isMobile ? 100 : 110}
              onChange={({ target }) => handleCapitalAtRiskChange(target.value)}
              icon={<LogoUsdc />}
            />
          </LabeledInput>
          <LabeledInput label='' lowerLabel={null} wrapperClassName='flex-row-overwrite mb-10'>
            <p className='mb-0'>Offered Odds</p>
            <span className='color-white'>{calcOfferedOdds()}</span>
          </LabeledInput>
          <div className='color-white mb-5'>
            <Flex classes='items-center mb-10'>
              <span className='fs-xs'>{insideOrOutside === "OUTSIDE" ? "Premium Paid" : "Bet"}</span>
              <span className='ml-6 fs-md-bold'>{capitalAtRisk}</span>
              <LogoUsdc />;
              <span className='fs-xs ml-6'>{insideOrOutside === "OUTSIDE" ? "Max Gain" : "Potential PnL"} </span>
              <span className='ml-6 fs-md-bold mr-2'>{Number(targetEarn) - Number(capitalAtRisk)}</span>
              <LogoUsdc />
            </Flex>
          </div>
        </Flex>
      )}

      <ChartPayoff
        // id='bet-chart'
        id={`bet-chart${compact ? "-compact" : ""}`}
        compact={compact}
        chartData={payoffMap ?? CHART_FAKE_DATA}
        height={chartHeight}
        showKeys={false}
        showPortial={!compact && payoffMap !== undefined}
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
      {!compact && <OrderSummary asContainer={false} orderSummary={orderDetails} submitAuction={handleSubmit} />}

      <Toast toastList={toastList} position={position} />
    </>
  );
};

export default Bet;
