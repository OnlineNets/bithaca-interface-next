/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import React, { useEffect, useState } from "react";
import { TradingStoriesProps } from "../../TradingStories";
import { PositionBuilderStrategy, AuctionSubmission } from "@/pages/trading/position-builder";

// Components
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import Input from "@/UI/components/Input/Input";
import LogoEth from "@/UI/components/Icons/LogoEth";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import LabeledControl from "@/UI/components/LabeledControl/LabeledControl";
import Toast from "@/UI/components/Toast/Toast";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";
import { SIDE_OPTIONS, TYPE_OPTIONS } from "@/UI/constants/options";

// Utils
import { getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { ClientConditionalOrder, Leg, calculateNetPrice, createClientOrderId } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";
import { useDevice } from "@/UI/hooks/useDevice";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import OptionInstructions from "../../Instructions/OptionDescription";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { findStrikeClosestToSpot } from "@/UI/utils/StrikeUtil";
import { usePrice } from "@/services/pricing/usePrice";
import { OrderSummaryType } from "@/types/orderSummary";
import { useCalcIv } from "@/services/pricing/useCalcIv";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

dayjs.extend(duration);

const Options = ({ showInstructions, compact, chartHeight }: TradingStoriesProps) => {
  const { ithacaSDK, currencyPrecision, getContractsByPayoff, currentExpiryDate, currentSpotPrice } = useAppStore();
  const device = useDevice();
  const [callContracts, setCallContracts] = useState(getContractsByPayoff("Call"));
  const [putContracts, setPutContracts] = useState(getContractsByPayoff("Put"));
  const strikeList = Object.keys(getContractsByPayoff("Call")).map(strike => ({ name: strike, value: strike }));
  const [strikes, setStrikes] = useState(strikeList);

  const [callOrPut, setCallOrPut] = useState<"Call" | "Put">("Call");
  const [buyOrSell, setBuyOrSell] = useState<"BUY" | "SELL">("BUY");
  const [size, setSize] = useState("1");
  const [strike, setStrike] = useState<string>(findStrikeClosestToSpot([...strikeList], currentSpotPrice));
  const [unitPrice, setUnitPrice] = useState("");

  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);

  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();

  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();

  const { unitPrice: remoteUnitPriceReference, isLoading: isUnitPriceLoading } = usePrice({
    isForward: false,
    optionType: callOrPut,
    expiryDate: currentExpiryDate,
    strike: strike,
    side: buyOrSell,
  });

  const { iv: ivFormatted, greeks } = useCalcIv({
    unitPrice,
    strike,
    isCall: callOrPut === "Call",
    side: buyOrSell,
  });

  useEffect(() => {
    setUnitPrice(remoteUnitPriceReference);
  }, [remoteUnitPriceReference]);

  useEffect(() => {
    handleStrikeChange(callOrPut, buyOrSell, getNumber(size), strike, unitPrice);
  }, [callOrPut, buyOrSell, size, strike, unitPrice]);

  const handleCallOrPutChange = async (callOrPut: "Call" | "Put") => {
    setCallOrPut(callOrPut);
  };

  useEffect(() => {
    const callContracts = getContractsByPayoff("Call");
    const putContracts = getContractsByPayoff("Put");
    setCallContracts(callContracts);
    setPutContracts(putContracts);
    const strikeList = Object.keys(callContracts).map(strike => ({ name: strike, value: strike }));
    setStrikes(strikeList);
    const closest = findStrikeClosestToSpot([...strikeList], currentSpotPrice);

    if (closest !== strike) {
      setStrike(closest);
    }
  }, [currentExpiryDate]);

  const handleBuyOrSellChange = async (buyOrSell: "BUY" | "SELL") => {
    setBuyOrSell(buyOrSell);
  };

  const handleSizeChange = async (amount: string, price?: string) => {
    const size = getNumberValue(amount);
    setSize(size);
  };

  const handleUnitPriceChange = async (amount: string) => {
    const unitPrice = getNumberValue(amount);
    setUnitPrice(unitPrice);
  };

  const handleStrikeChange = async (
    callOrPut: "Call" | "Put",
    buyOrSell: "BUY" | "SELL",
    size: number,
    strike: string,
    unitPrice: string
  ) => {
    if (isInvalidNumber(size) || isInvalidNumber(Number(unitPrice))) {
      setOrderDetails(undefined);
      setPayoffMap(undefined);
      return;
    }

    const contract = callOrPut === "Call" ? callContracts[strike] : putContracts[strike];

    const leg: Leg = {
      contractId: contract.contractId,
      quantity: `${size}`,
      side: buyOrSell,
    };

    const referencePrice = getNumber(unitPrice);

    const order: ClientConditionalOrder = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: calculateNetPrice([leg], [referencePrice], currencyPrecision.strike),
      legs: [leg],
    };

    const payoffMap = estimateOrderPayoff([{ ...contract, ...leg, premium: referencePrice }]);
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
      console.error(`Order estimation for ${callOrPut} failed`, error);
    }
  };

  const handleSubmit = async () => {
    if (!orderDetails) return;
    if (orderDetails)
      setAuctionSubmission({
        order: orderDetails?.order,
        type: callOrPut,
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

  const renderInstruction = () => {
    return <>{!compact && showInstructions && <OptionInstructions />}</>;
  };

  return (
    <>
      {renderInstruction()}
      <Flex direction='row' margin={`${compact ? "mb-12" : "mb-34"}`} gap='gap-12'>
        {compact && (
          <RadioButton
            size={compact ? "compact" : "regular"}
            width={compact ? 120 : 110}
            options={TYPE_OPTIONS}
            name={compact ? "callOrPutCompact" : "callOrPut"}
            selectedOption={callOrPut}
            onChange={value => handleCallOrPutChange(value as "Call" | "Put")}
          />
        )}
        {!compact && (
          <>
            <LabeledControl label='Type'>
              <RadioButton
                size={compact ? "compact" : "regular"}
                width={compact ? 120 : 110}
                options={TYPE_OPTIONS}
                name={compact ? "callOrPutCompact" : "callOrPut"}
                selectedOption={callOrPut}
                onChange={value => handleCallOrPutChange(value as "Call" | "Put")}
              />
            </LabeledControl>

            <LabeledControl label='Side'>
              <RadioButton
                options={SIDE_OPTIONS}
                name='buyOrSell'
                orientation='vertical'
                selectedOption={buyOrSell}
                onChange={value => handleBuyOrSellChange(value as "BUY" | "SELL")}
              />
            </LabeledControl>

            {/** Mising validation */}
            <LabeledControl label='Size'>
              <Input
                max={MAXIMUM_POSITION_SIZE}
                type='number'
                icon={<LogoEth />}
                width={device === "desktop" ? 105 : undefined}
                increment={direction =>
                  size && handleSizeChange((direction === "UP" ? Number(size) + 1 : Number(size) - 1).toString())
                }
                value={size}
                onChange={({ target }) => handleSizeChange(target.value)}
              />
            </LabeledControl>

            <LabeledControl label='Strike'>
              <DropdownMenu
                options={strikes}
                iconEnd={<LogoUsdc />}
                value={strike ? { name: strike, value: strike } : undefined}
                onChange={value => {
                  setStrike(value);
                }}
              />
            </LabeledControl>

            <LabeledControl label='Unit Price'>
              <Input
                isLoading={isUnitPriceLoading}
                type='number'
                icon={<LogoUsdc />}
                footerText={!isUnitPriceLoading ? ivFormatted : undefined}
                value={unitPrice}
                onChange={({ target }) => handleUnitPriceChange(target.value)}
              />
            </LabeledControl>
          </>
        )}
      </Flex>
      <Toast toastList={toastList} position={position} />
      <ChartPayoff
        // id='options-chart'
        id={`options-chart${compact ? "-compact" : ""}`}
        compact={compact}
        chartData={payoffMap ?? CHART_FAKE_DATA}
        height={chartHeight}
        showKeys={false}
        showPortial={!compact && payoffMap !== undefined}
        infoPopup={{
          type: "options",
          greeks,
          callOrPut: callOrPut,
          side: buyOrSell,
          showInstructions,
        }}
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
          positionBuilderStrategies={
            [
              { leg: orderDetails.order.legs[0], referencePrice: unitPrice, payoff: callOrPut, strike: strike },
            ] as unknown as PositionBuilderStrategy[]
          }
          orderSummary={orderDetails}
        />
      )}
      {!compact && <OrderSummary asContainer={false} orderSummary={orderDetails} submitAuction={handleSubmit} />}
    </>
  );
};

export default Options;
