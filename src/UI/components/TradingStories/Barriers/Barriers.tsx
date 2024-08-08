/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import React, { useEffect, useState } from "react";
import { TradingStoriesProps } from "..";
import { PositionBuilderStrategy, AuctionSubmission } from "@/pages/trading/position-builder";

// Components
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import Input from "@/UI/components/Input/Input";
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import BarrierInstructions from "@/UI/components/Instructions/BarrierInstructions";
import LabeledControl from "@/UI/components/LabeledControl/LabeledControl";
import BarrierDescription from "@/UI/components/Instructions/BarrierDescription";
import Toast from "@/UI/components/Toast/Toast";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";
import { IN_OUT_OPTIONS, SIDE_OPTIONS, UP_DOWN_OPTIONS } from "@/UI/constants/options";

// Utils
import { formatNumberByCurrency, getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";
import { OptionLeg, PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { ClientConditionalOrder, Leg, createClientOrderId, calculateNetPrice, toPrecision } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";

// Styles
import styles from "./Barriers.module.scss";
import { DESCRIPTION_OPTIONS } from "@/UI/constants/tabCard";
import radioButtonStyles from "@/UI/components/RadioButton/RadioButton.module.scss";
import { getBarrierStrikes, getStrikes } from "./Barriers.utils";
import { MOBILE_BREAKPOINT } from "@/UI/constants/breakpoints";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { closestStrike } from "@/UI/utils/StrikeUtil";
import { fetchPriceForUnit } from "@/services/pricing/calcPrice.api.service";
import { OrderSummaryType } from "@/types/orderSummary";
import { calculateBidAsk } from "@/services/pricing/helpers";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

const Barriers = ({ showInstructions, compact, chartHeight, onRadioChange }: TradingStoriesProps) => {
  const { ithacaSDK, getContractsByPayoff, currentExpiryDate, currencyPrecision, currentSpotPrice, quotingParams } =
    useAppStore();
  const callContracts = getContractsByPayoff("Call");
  const putContracts = getContractsByPayoff("Put");
  const binaryCallContracts = getContractsByPayoff("BinaryCall");
  const binaryPutContracts = getContractsByPayoff("BinaryPut");
  const closestStrikeToSpot = closestStrike(Number(currentSpotPrice)).toString();
  const strikeList = getStrikes(callContracts, closestStrikeToSpot, "UP");
  const barrierStrikeList = getBarrierStrikes(callContracts, strikeList[0], "UP");
  const [strikes, setStrikes] = useState(strikeList);
  const [barrierStrikes, setBarrierStrikes] = useState(barrierStrikeList);
  const [buyOrSell, setBuyOrSell] = useState<"BUY" | "SELL">("BUY");
  const [upOrDown, setUpOrDown] = useState<"UP" | "DOWN">("UP");
  const [inOrOut, setInOrOut] = useState<"IN" | "OUT">("IN");
  const [strike, setStrike] = useState<string>(strikeList[0]);
  const [barrier, setBarrier] = useState<string>(closestStrikeToSpot);
  const [size, setSize] = useState("");
  const [unitPrice, setUnitPrice] = useState("-");
  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();

  useEffect(() => {
    handleUpOrDownChange("UP");
  }, []);

  const handleBuyOrSellChange = async (buyOrSell: "BUY" | "SELL") => {
    setBuyOrSell(buyOrSell);
    if (!strike || !barrier) return;
    prepareOrderLegs(buyOrSell, upOrDown, strike, inOrOut, barrier, getNumber(size));
  };

  const handleUpOrDownChange = async (upOrDown: "UP" | "DOWN") => {
    setUpOrDown(upOrDown);
    const SPREAD = 200;

    const closestStrikeToSpot = closestStrike(Number(currentSpotPrice));
    if (upOrDown === "UP") {
      const newStrike = closestStrikeToSpot.toString();
      const newBarrierStrike = (closestStrikeToSpot + SPREAD).toString();
      setStrike(newStrike);
      setBarrier(newBarrierStrike);

      const strikes = getStrikes(callContracts, newBarrierStrike, upOrDown);
      const barrierStrikes = getBarrierStrikes(callContracts, newStrike, upOrDown);
      setBarrierStrikes(barrierStrikes);
      setStrikes(strikes);
      await prepareOrderLegs(buyOrSell, upOrDown, newStrike, inOrOut, newBarrierStrike, getNumber(size));
    } else {
      const newStrike = (closestStrikeToSpot - 100).toString();
      const newBarrierStrike = (closestStrikeToSpot - 100 - SPREAD).toString();
      setStrike(newStrike);
      setBarrier(newBarrierStrike);

      const strikes = getStrikes(callContracts, newBarrierStrike, upOrDown);
      const barrierStrikes = getBarrierStrikes(callContracts, newStrike, upOrDown);
      setBarrierStrikes(barrierStrikes);
      setStrikes(strikes);
      if (!strike || !barrier) return;
      await prepareOrderLegs(buyOrSell, upOrDown, newStrike, inOrOut, newBarrierStrike, getNumber(size));
    }

    if (onRadioChange) onRadioChange(DESCRIPTION_OPTIONS[`${upOrDown}_${inOrOut}`]);
  };

  const handleInOrOutChange = async (inOrOut: "IN" | "OUT") => {
    setInOrOut(inOrOut);
    if (onRadioChange) onRadioChange(DESCRIPTION_OPTIONS[`${upOrDown}_${inOrOut}`]);
    if (!strike || !barrier) return;
    await prepareOrderLegs(buyOrSell, upOrDown, strike, inOrOut, barrier, getNumber(size));
  };

  const handleStrikeChange = async (strike: string) => {
    setStrike(strike);
    if (!strike || !barrier) return;
    await prepareOrderLegs(buyOrSell, upOrDown, strike, inOrOut, barrier, getNumber(size));
  };

  const handleBarrierChange = async (barrier: string) => {
    setBarrier(barrier);
    if (!strike || !barrier) return;
    await prepareOrderLegs(buyOrSell, upOrDown, strike, inOrOut, barrier, getNumber(size));
  };

  const handleSizeChange = async (amount: string) => {
    const size = getNumberValue(amount);
    setSize(size);
    if (!strike || !barrier) return;
    await prepareOrderLegs(buyOrSell, upOrDown, strike, inOrOut, barrier, getNumber(size));
  };

  const prepareOrderLegs = async (
    buyOrSell: "BUY" | "SELL",
    upOrDown: "UP" | "DOWN",
    strike: string,
    inOrOut: "IN" | "OUT",
    barrier: string,
    size: number,
    price?: number
  ) => {
    if (isInvalidNumber(size)) {
      setOrderDetails(undefined);
      setPayoffMap(undefined);
      return;
    }

    let legs: Leg[];
    let referencePrices: number[];
    let estimatePayoffData: OptionLeg[];
    if (upOrDown === "UP") {
      if (inOrOut === "IN") {
        const buyCallContract = callContracts[barrier];
        const buyBinaryCallContract = binaryCallContracts[barrier];
        const buyCallLeg: Leg = {
          contractId: buyCallContract.contractId,
          quantity: `${size}`,
          side: buyOrSell,
        };
        const buyBinaryCallLeg: Leg = {
          contractId: buyBinaryCallContract.contractId,
          quantity: `${size * (getNumber(barrier) - getNumber(strike))}`,
          side: buyOrSell,
        };
        legs = [buyCallLeg, buyBinaryCallLeg];
        const [buyCallContractBarrierPriceReference, buyBinaryCallContractBarrierPriceReference] = await Promise.all([
          fetchPriceForUnit({
            isForward: false,
            optionType: "Call",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "BUY",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice: currentSpotPrice,
          }),
          fetchPriceForUnit({
            isForward: false,
            optionType: "BinaryCall",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "BUY",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice: currentSpotPrice,
          }),
        ]);

        referencePrices = [
          buyCallContractBarrierPriceReference
            ? getNumber(buyCallContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(buyCallContract.referencePrice),
                optionType: "Call",
                side: "BUY",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice,
              }),
          buyBinaryCallContractBarrierPriceReference
            ? getNumber(buyBinaryCallContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(buyBinaryCallContract.referencePrice),
                optionType: "BinaryCall",
                side: "BUY",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice,
              }),
        ];

        estimatePayoffData = [
          {
            ...buyCallContract,
            ...buyCallLeg,
            premium: price || referencePrices[0],
          },
          {
            ...buyBinaryCallContract,
            ...buyBinaryCallLeg,
            premium: price || referencePrices[1],
          },
        ];
      } else {
        const buyCallContract = callContracts[strike];
        const sellCallContract = callContracts[barrier];
        const sellBinaryCallContract = binaryCallContracts[barrier];

        const buyCallLeg: Leg = {
          contractId: buyCallContract.contractId,
          quantity: `${size}`,
          side: buyOrSell,
        };

        const sellCallLeg: Leg = {
          contractId: sellCallContract.contractId,
          quantity: `${size}`,
          side: buyOrSell === "BUY" ? "SELL" : "BUY",
        };

        const sellBinaryCallLeg: Leg = {
          contractId: sellBinaryCallContract.contractId,
          quantity: `${size * (getNumber(barrier) - getNumber(strike))}`,
          side: buyOrSell === "BUY" ? "SELL" : "BUY",
        };

        const [
          buyCallContractStrikePriceReference,
          sellCallContractBarrierPriceReference,
          sellBinaryCallContractBarrierPriceReference,
        ] = await Promise.all([
          fetchPriceForUnit({
            isForward: false,
            optionType: "Call",
            expiryDate: currentExpiryDate,
            strike: strike,
            side: "BUY",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice,
          }),
          fetchPriceForUnit({
            isForward: false,
            optionType: "Call",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "SELL",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice,
          }),
          fetchPriceForUnit({
            isForward: false,
            optionType: "BinaryCall",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "SELL",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice,
          }),
        ]);

        legs = [buyCallLeg, sellCallLeg, sellBinaryCallLeg];
        referencePrices = [
          buyCallContractStrikePriceReference
            ? getNumber(buyCallContractStrikePriceReference)
            : calculateBidAsk({
                midPrice: Number(buyCallContract.referencePrice),
                optionType: "Call",
                side: "BUY",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice,
              }),
          sellCallContractBarrierPriceReference
            ? getNumber(sellCallContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(sellCallContract.referencePrice),
                optionType: "Call",
                side: "SELL",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice,
              }),
          sellBinaryCallContractBarrierPriceReference
            ? getNumber(sellBinaryCallContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(sellBinaryCallContract.referencePrice),
                optionType: "BinaryCall",
                side: "SELL",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice,
              }),
        ];

        estimatePayoffData = [
          {
            ...buyCallContract,
            ...buyCallLeg,
            premium: price || referencePrices[0],
          },
          {
            ...sellCallContract,
            ...sellCallLeg,
            premium: price || referencePrices[1],
          },
          {
            ...sellBinaryCallContract,
            ...sellBinaryCallLeg,
            premium: price || referencePrices[2],
          },
        ];
      }
    } else {
      if (inOrOut == "IN") {
        const buyPutContract = putContracts[barrier];
        const buyBinaryPutContract = binaryPutContracts[barrier];
        const buyPutLeg: Leg = {
          contractId: buyPutContract.contractId,
          quantity: `${size}`,
          side: buyOrSell,
        };

        const buyBinaryPutLeg: Leg = {
          contractId: buyBinaryPutContract.contractId,
          quantity: `${size * (getNumber(strike) - getNumber(barrier))}`,
          side: buyOrSell,
        };

        legs = [buyPutLeg, buyBinaryPutLeg];

        const [buyPutContractBarrierPriceReference, buyBinaryPutContractBarrierPriceReference] = await Promise.all([
          fetchPriceForUnit({
            isForward: false,
            optionType: "Put",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "BUY",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice: currentSpotPrice,
          }),
          fetchPriceForUnit({
            isForward: false,
            optionType: "BinaryPut",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "BUY",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice: currentSpotPrice,
          }),
        ]);

        referencePrices = [
          buyPutContractBarrierPriceReference
            ? getNumber(buyPutContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(buyPutContract.referencePrice),
                optionType: "Put",
                side: "BUY",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice: currentSpotPrice,
              }),
          buyBinaryPutContractBarrierPriceReference
            ? getNumber(buyBinaryPutContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(buyBinaryPutContract.referencePrice),
                optionType: "BinaryPut",
                side: "BUY",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice: currentSpotPrice,
              }),
        ];
        estimatePayoffData = [
          {
            ...buyPutContract,
            ...buyPutLeg,
            premium: price || referencePrices[0],
          },
          {
            ...buyBinaryPutContract,
            ...buyBinaryPutLeg,
            premium: price || referencePrices[1],
          },
        ];
      } else {
        const buyPutContract = putContracts[strike];
        const sellPutContract = putContracts[barrier];
        const sellBinaryPutContract = binaryPutContracts[barrier];

        const buyPutLeg: Leg = {
          contractId: buyPutContract.contractId,
          quantity: `${size}`,
          side: buyOrSell,
        };

        const sellPutLeg: Leg = {
          contractId: sellPutContract.contractId,
          quantity: `${size}`,
          side: buyOrSell === "BUY" ? "SELL" : "BUY",
        };

        const sellBinaryPutLeg: Leg = {
          contractId: sellBinaryPutContract.contractId,
          quantity: `${size * (getNumber(strike) - getNumber(barrier))}`,
          side: buyOrSell === "BUY" ? "SELL" : "BUY",
        };

        legs = [buyPutLeg, sellPutLeg, sellBinaryPutLeg];

        const [
          buyPutContractStrikePriceReference,
          sellPutContractBarrierPriceReference,
          sellBinaryPutContractBarrierPriceReference,
        ] = await Promise.all([
          fetchPriceForUnit({
            isForward: false,
            optionType: "Put",
            expiryDate: currentExpiryDate,
            strike: strike,
            side: "BUY",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice,
          }),
          fetchPriceForUnit({
            isForward: false,
            optionType: "Put",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "SELL",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice,
          }),
          fetchPriceForUnit({
            isForward: false,
            optionType: "BinaryPut",
            expiryDate: currentExpiryDate,
            strike: barrier,
            side: "SELL",
            forcedSpread: quotingParams.DIGITAL_SPREAD,
            currentSpotPrice,
          }),
        ]);

        referencePrices = [
          buyPutContractStrikePriceReference
            ? getNumber(buyPutContractStrikePriceReference)
            : calculateBidAsk({
                midPrice: Number(buyPutContract.referencePrice),
                optionType: "Put",
                side: "BUY",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice: currentSpotPrice,
              }),
          sellPutContractBarrierPriceReference
            ? getNumber(sellPutContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(sellPutContract.referencePrice),
                optionType: "Put",
                side: "SELL",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice: currentSpotPrice,
              }),
          sellBinaryPutContractBarrierPriceReference
            ? getNumber(sellBinaryPutContractBarrierPriceReference)
            : calculateBidAsk({
                midPrice: Number(sellBinaryPutContract.referencePrice),
                optionType: "BinaryPut",
                side: "SELL",
                forcedSpread: quotingParams.DIGITAL_SPREAD,
                currentSpotPrice: currentSpotPrice,
              }),
        ];
        estimatePayoffData = [
          {
            ...buyPutContract,
            ...buyPutLeg,
            premium: price || referencePrices[0],
          },
          {
            ...sellPutContract,
            ...sellPutLeg,
            premium: price || referencePrices[1],
          },
          {
            ...sellBinaryPutContract,
            ...sellBinaryPutLeg,
            premium: price || referencePrices[2],
          },
        ];
      }
    }

    const unitPrice = calculateNetPrice(legs, referencePrices, currencyPrecision.strike, size);
    if (price === undefined) {
      setUnitPrice(formatNumberByCurrency(Number(unitPrice), "string", "USDC"));
    }
    const totalPrice =
      price !== undefined
        ? legs.reduce((acc, leg) => {
            acc = getNumber(leg.quantity) * price + acc;
            return acc;
          }, 0)
        : Number(unitPrice) * size;

    const order: ClientConditionalOrder = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: `${totalPrice}`,
      legs,
    };

    const payoffMap = estimateOrderPayoff(estimatePayoffData);
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
      console.error("Order estimation for barriers failed", error);
    }
  };

  const handleSubmit = async () => {
    const getOrderDesc = () => {
      if (upOrDown === "UP") {
        return inOrOut === "IN" ? "The Sniper" : "The Highwire Act";
      } else {
        return inOrOut === "IN" ? "Guardian Angel Depth Charge" : "The Bungee Jumper";
      }
    };

    if (!orderDetails) return;

    setAuctionSubmission({
      order: orderDetails?.order,
      type: getOrderDesc(),
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

  useEffect(() => {
    handleSizeChange("1");
  }, [currentExpiryDate]);

  useEffect(() => {
    renderInstruction();
  }, [buyOrSell]);

  const renderInstruction = () => {
    return (
      <>
        {!compact && showInstructions && (
          <BarrierInstructions upOrDown={upOrDown} inOrOut={inOrOut} currentExpiry={currentExpiryDate.toString()} />
        )}
      </>
    );
  };

  return (
    <>
      {renderInstruction()}
      {compact ? (
        <Flex gap='gap-3' margin='mb-10'>
          <RadioButton
            size={compact ? "compact" : "regular"}
            options={SIDE_OPTIONS}
            selectedOption={buyOrSell}
            name='buyOrSellCompact'
            orientation='vertical'
            onChange={value => handleBuyOrSellChange(value as "BUY" | "SELL")}
            radioButtonClassName={styles.sideRadioButtonClassName}
            labelClassName={styles.sideLabel}
          />

          <RadioButton
            size={compact ? "compact" : "regular"}
            options={UP_DOWN_OPTIONS}
            selectedOption={upOrDown}
            name='upOrDownCompact'
            orientation='vertical'
            onChange={value => handleUpOrDownChange(value as "UP" | "DOWN")}
            labelClassName={radioButtonStyles.microLabels}
          />

          <RadioButton
            size={compact ? "compact" : "regular"}
            options={IN_OUT_OPTIONS}
            selectedOption={inOrOut}
            name='inOrOutCompact'
            orientation='vertical'
            onChange={value => handleInOrOutChange(value as "IN" | "OUT")}
            labelClassName={radioButtonStyles.microLabels}
          />
        </Flex>
      ) : (
        <div className='inputs'>
          <Flex direction='column' margin='mt-20 mb-20' gap='gap-16'>
            <Flex direction='row-center' gap='gap-10'>
              {/** Needs hooking up */}

              <LabeledControl label='Side' labelClassName='mb-4'>
                <RadioButton
                  labelClassName='height-23'
                  width={42}
                  radioButtonClassName='height-51'
                  options={SIDE_OPTIONS}
                  selectedOption={buyOrSell}
                  name='buyOrSell'
                  orientation='vertical'
                  onChange={value => handleBuyOrSellChange(value as "BUY" | "SELL")}
                />
              </LabeledControl>
              <LabeledControl label=''>
                <RadioButton
                  width={50}
                  options={UP_DOWN_OPTIONS}
                  selectedOption={upOrDown}
                  name='upOrDown'
                  orientation='vertical'
                  onChange={value => handleUpOrDownChange(value as "UP" | "DOWN")}
                  radioButtonClassName={styles.radioButtonClassName}
                  optionClassName={styles.optionClassName}
                  labelClassName={`${styles.labelClassName} ${radioButtonStyles.microLabels}`}
                />
              </LabeledControl>

              <LabeledControl label='Strike' labelClassName='mb-16'>
                <DropdownMenu
                  width={80}
                  options={strikes.map(strike => ({ name: strike, value: strike }))}
                  value={strike ? { name: strike, value: strike } : undefined}
                  onChange={handleStrikeChange}
                />
              </LabeledControl>

              <h5 className='mt-22 color-white'>Knock</h5>

              <LabeledControl label=''>
                <RadioButton
                  width={isMobile ? 80 : undefined}
                  options={IN_OUT_OPTIONS}
                  selectedOption={inOrOut}
                  name='inOrOut'
                  orientation='vertical'
                  onChange={value => handleInOrOutChange(value as "IN" | "OUT")}
                  radioButtonClassName={styles.radioButtonClassName}
                  optionClassName={styles.optionClassName}
                  labelClassName={`${styles.labelClassName} ${radioButtonStyles.microLabels}`}
                />
              </LabeledControl>

              <p className='mt-22'>@</p>

              <LabeledControl label='Barrier' labelClassName={!isMobile ? "mb-16" : ""}>
                <DropdownMenu
                  width={80}
                  options={barrierStrikes.map(strike => ({ name: strike, value: strike }))}
                  value={barrier ? { name: barrier, value: barrier } : undefined}
                  onChange={handleBarrierChange}
                />
              </LabeledControl>

              <LabeledControl label='Size' labelClassName={!isMobile ? "mb-16" : ""}>
                <Input
                  max={MAXIMUM_POSITION_SIZE}
                  type='number'
                  value={size}
                  onChange={({ target }) => handleSizeChange(target.value)}
                  width={isMobile ? 140 : 80}
                />
              </LabeledControl>

              <LabeledControl label='Unit Price' labelClassName={!isMobile ? "mb-16" : ""}>
                <span className='fs-md-bold color-white'>{Math.abs(getNumber(unitPrice))}</span>
              </LabeledControl>
            </Flex>
          </Flex>
        </div>
      )}

      {!compact && showInstructions && (
        <BarrierDescription
          upOrDown={upOrDown}
          buyOrSell={buyOrSell}
          inOrOut={inOrOut}
          currentExpiryDate={currentExpiryDate.toString()}
          strikeAmount={strike}
          barrierAmount={barrier}
        />
      )}

      <Toast toastList={toastList} position={position} />

      <ChartPayoff
        // id='barriers-chart'
        id={`barriers-chart${compact ? "-compact" : ""}`}
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
    </>
  );
};

export default Barriers;
