/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import React, { useEffect, useState } from "react";
import { TradingStoriesProps } from "../../TradingStories";
import { PositionBuilderStrategy, AuctionSubmission } from "@/pages/trading/position-builder";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import Input from "@/UI/components/Input/Input";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import LabeledControl from "@/UI/components/LabeledControl/LabeledControl";
import Toast from "@/UI/components/Toast/Toast";

// Utils
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";
import { getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";
import { DIGITAL_OPTIONS, SIDE_OPTIONS } from "@/UI/constants/options";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { Leg, ClientConditionalOrder, createClientOrderId, calculateNetPrice } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import DigitalInstructions from "../../Instructions/DigitalInstructions";
import OrderSummary from "../../OrderSummary/OrderSummary";
import { findStrikeClosestToSpot } from "@/UI/utils/StrikeUtil";
import { usePrice } from "@/services/pricing/usePrice";
import { OrderSummaryType } from "@/types/orderSummary";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

const DigitalOptions = ({ showInstructions, compact, chartHeight }: TradingStoriesProps) => {
  const { ithacaSDK, currencyPrecision, getContractsByPayoff, currentExpiryDate, currentSpotPrice } = useAppStore();
  const [binaryCallContracts, setBinaryCallContracts] = useState(getContractsByPayoff("BinaryCall"));
  const [binaryPutContracts, setBinaryPutContracts] = useState(getContractsByPayoff("BinaryPut"));
  const strikeList = Object.keys(getContractsByPayoff("BinaryCall")).map(strike => ({ name: strike, value: strike }));
  const [strikes, setStrikes] = useState(strikeList);

  const [binaryCallOrPut, setBinaryCallOrPut] = useState<"BinaryCall" | "BinaryPut">("BinaryCall");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [size, setSize] = useState("100");
  const [strike, setStrike] = useState<string>(findStrikeClosestToSpot([...strikeList], currentSpotPrice));
  const [unitPrice, setUnitPrice] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);

  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();

  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();

  const { unitPrice: remoteUnitPriceReference, isLoading: isUnitPriceLoading } = usePrice({
    isForward: false,
    optionType: binaryCallOrPut,
    expiryDate: currentExpiryDate,
    strike: strike,
    side: side,
  });

  // Comprehensive dependencies will force setUnitPrice to take place
  // even though unitPrice from backend it's not changed
  useEffect(() => {
    setUnitPrice(remoteUnitPriceReference);
  }, [remoteUnitPriceReference, strike, binaryCallOrPut, currentExpiryDate]);

  useEffect(() => {
    handleStrikeChange(binaryCallOrPut, side, getNumber(size), strike, unitPrice);
  }, [binaryCallOrPut, side, size, strike, unitPrice]);

  useEffect(() => {
    const binaryCallContracts = getContractsByPayoff("BinaryCall");
    const binaryPutContracts = getContractsByPayoff("BinaryPut");
    setBinaryCallContracts(binaryCallContracts);
    setBinaryPutContracts(binaryPutContracts);
    const strikeList = Object.keys(getContractsByPayoff("BinaryCall")).map(strike => ({ name: strike, value: strike }));
    setStrikes(strikeList);
    const closest = findStrikeClosestToSpot([...strikeList], currentSpotPrice);
    if (closest !== strike) {
      setStrike(closest);
    }
  }, [currentExpiryDate]);

  const handleBinaryCallOrPutChange = async (binaryCallOrPut: "BinaryCall" | "BinaryPut") => {
    setBinaryCallOrPut(binaryCallOrPut);
  };

  const handleSideChange = async (side: "BUY" | "SELL") => {
    setSide(side);
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
    binaryCallOrPut: "BinaryCall" | "BinaryPut",
    side: "BUY" | "SELL",
    size: number,
    strike: string,
    unitPrice: string
  ) => {
    if (isInvalidNumber(size) || isInvalidNumber(Number(unitPrice))) {
      setOrderDetails(undefined);
      setPayoffMap(undefined);
      return;
    }

    const contract = binaryCallOrPut === "BinaryCall" ? binaryCallContracts[strike] : binaryPutContracts[strike];
    const leg: Leg = {
      contractId: contract.contractId,
      quantity: `${size}`,
      side: side,
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
      console.error(`Order estimation for ${binaryCallOrPut} failed`, error);
    }
  };

  const handleSubmit = async () => {
    if (!orderDetails) return;
    if (orderDetails)
      setAuctionSubmission({
        order: orderDetails?.order,
        type: binaryCallOrPut === "BinaryCall" ? "Digital Call" : "Digital Put",
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
    return <>{!compact && showInstructions && <DigitalInstructions />}</>;
  };

  return (
    <>
      {renderInstruction()}
      <Flex direction='row' margin={`${compact ? "mb-12" : "mb-34"}`} gap='gap-12'>
        {compact && (
          <RadioButton
            size={compact ? "compact" : "regular"}
            width={compact ? 120 : 110}
            options={DIGITAL_OPTIONS}
            name={compact ? "binaryCallOrPutCompact" : "binaryCallOrPut"}
            selectedOption={binaryCallOrPut}
            onChange={value => handleBinaryCallOrPutChange(value as "BinaryCall" | "BinaryPut")}
          />
        )}
        {!compact && (
          <>
            <LabeledControl label='Type'>
              <RadioButton
                size={compact ? "compact" : "regular"}
                width={compact ? 120 : 110}
                options={DIGITAL_OPTIONS}
                name={compact ? "binaryCallOrPutCompact" : "binaryCallOrPut"}
                selectedOption={binaryCallOrPut}
                onChange={value => handleBinaryCallOrPutChange(value as "BinaryCall" | "BinaryPut")}
              />
            </LabeledControl>

            <LabeledControl label='Side'>
              <RadioButton
                options={SIDE_OPTIONS}
                name='side'
                orientation='vertical'
                selectedOption={side}
                onChange={value => handleSideChange(value as "BUY" | "SELL")}
              />
            </LabeledControl>

            {/** Mising validation */}
            <LabeledControl label='Size'>
              <Input
                max={MAXIMUM_POSITION_SIZE}
                type='number'
                icon={<LogoUsdc />}
                width={105}
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
                value={unitPrice}
                onChange={({ target }) => handleUnitPriceChange(target.value)}
              />
            </LabeledControl>

            {/* <LabeledControl label='Collateral' labelClassName='justify-end'>
              <PriceLabel className='height-34' icon={<LogoEth />} label={calcCollateral()} />
            </LabeledControl>

            <LabeledControl label='Premium' labelClassName='justify-end'>
              <PriceLabel
                className='height-34'
                icon={<LogoUsdc />}
                label={orderDetails ? getNumberFormat(orderDetails.order.totalNetPrice) : '-'}
              />
            </LabeledControl> */}

            {/** Add disabled logic, add wrong network and not connected logic */}
            {/* <Button size='sm' title='Click to submit to auction' onClick={handleSubmit} className='align-self-end'>
              Submit to Auction
            </Button> */}
          </>
        )}
      </Flex>
      <Toast toastList={toastList} position={position} />
      <ChartPayoff
        // id='digital-chart'
        id={`digital-chart${compact ? "-compact" : ""}`}
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
          positionBuilderStrategies={
            [
              { leg: orderDetails.order.legs[0], referencePrice: unitPrice, payoff: binaryCallOrPut, strike: strike },
            ] as unknown as PositionBuilderStrategy[]
          }
          orderSummary={orderDetails}
        />
      )}

      {!compact && <OrderSummary asContainer={false} orderSummary={orderDetails} submitAuction={handleSubmit} />}
      {/* {!compact && <Greeks />} */}
    </>
  );
};
export default DigitalOptions;
