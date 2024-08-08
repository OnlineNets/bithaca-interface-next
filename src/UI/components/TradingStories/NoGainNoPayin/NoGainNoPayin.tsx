/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import React, { useEffect, useState } from "react";
import { TradingStoriesProps } from "..";
import { PositionBuilderStrategy, AuctionSubmission } from "@/pages/trading/position-builder";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import LogoEth from "@/UI/components/Icons/LogoEth";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import Input from "@/UI/components/Input/Input";
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import NoGainNoPayinInstructions from "@/UI/components/Instructions/NoGainNoPayinInstructions";
import Asset from "@/UI/components/Asset/Asset";
import LabeledControl from "@/UI/components/LabeledControl/LabeledControl";
import Toast from "@/UI/components/Toast/Toast";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";

// Utils
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";
import { getNumber, isInvalidNumber, formatNumberByCurrency } from "@/UI/utils/Numbers";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";
import { TYPE_OPTIONS } from "@/UI/constants/options";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { ClientConditionalOrder, Leg, createClientOrderId, toPrecision } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";

//Styles
import radioButtonStyles from "@/UI/components/RadioButton/RadioButton.module.scss";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { MOBILE_BREAKPOINT } from "@/UI/constants/breakpoints";
import { OrderSummaryType } from "@/types/orderSummary";
import classNames from "classnames";
import { usePrice } from "@/services/pricing/usePrice";
import Loader from "../../Loader/Loader";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

const findStrike = (
  currentSpotPrice: number,
  strikes: { name: string; value: string }[],
  optionType: "Call" | "Put"
) => {
  const sortedStrikes = strikes.map(s => parseFloat(s.value)).sort((a, b) => a - b);
  if (optionType === "Call") {
    const belowStrikes = sortedStrikes.filter(strike => strike < currentSpotPrice);
    return belowStrikes.length >= 2 ? belowStrikes[belowStrikes.length - 2].toString() : null;
  } else if (optionType === "Put") {
    const aboveStrikes = sortedStrikes.filter(strike => strike > currentSpotPrice);
    return aboveStrikes.length >= 2 ? aboveStrikes[1].toString() : null;
  }
  return null;
};

const NoGainNoPayin = ({ showInstructions, compact, chartHeight }: TradingStoriesProps) => {
  const {
    ithacaSDK,
    currencyPrecision,
    getContractsByPayoff,
    currentExpiryDate,
    unFilteredContractList,
    currentSpotPrice,
  } = useAppStore();
  const callContracts = getContractsByPayoff("Call");
  const putContracts = getContractsByPayoff("Put");
  const binaryCallContracts = getContractsByPayoff("BinaryCall");
  const binaryPutContracts = getContractsByPayoff("BinaryPut");
  const strikes = callContracts ? Object.keys(callContracts).map(strike => ({ name: strike, value: strike })) : [];

  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [callOrPut, setCallOrPut] = useState<"Call" | "Put">("Call");

  const selectedStrike = findStrike(currentSpotPrice, strikes, callOrPut);
  const [priceReference, setPriceReference] = useState<string>(selectedStrike ? selectedStrike : "0");

  useEffect(() => {
    const selectedStrike = findStrike(currentSpotPrice, strikes, callOrPut);
    setPriceReference(selectedStrike ? selectedStrike : "0");
  }, [callOrPut]);

  const [maxPotentialLoss, setMaxPotentialLoss] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();
  const [positionBuilderStrategies, setPositionBuilderStrategies] = useState<PositionBuilderStrategy[]>([]);

  const { unitPrice: callOrPutRemoteUnitPriceReference, isLoading: isLoadingCallOrPut } = usePrice({
    isForward: false,
    optionType: callOrPut,
    expiryDate: currentExpiryDate,
    strike: priceReference,
  });

  const { unitPrice: binaryCallOrPutRemoteUnitPriceReference, isLoading: isLoadingBinaryCallOrPut } = usePrice({
    isForward: false,
    optionType: `Binary${callOrPut}`,
    expiryDate: currentExpiryDate,
    strike: priceReference,
  });

  const handleCallOrPutChange = async (callOrPut: "Call" | "Put") => {
    setCallOrPut(callOrPut);
    if (!priceReference) return;
  };

  const handleMaxPotentialLossChange = async (amount: string) => {
    setMaxPotentialLoss(amount);
    if (!priceReference) return;
  };

  const handleMultiplierChange = async (amount: string) => {
    setMultiplier(amount);
    if (!priceReference) return;
  };

  const handlePriceReferenceChange = () => {
    if (
      isLoadingBinaryCallOrPut ||
      isLoadingCallOrPut ||
      isInvalidNumber(getNumber(binaryCallOrPutRemoteUnitPriceReference))
    ) {
      return;
    }
    if (maxPotentialLoss ? isInvalidNumber(getNumber(maxPotentialLoss)) : isInvalidNumber(getNumber(multiplier))) {
      setOrderDetails(undefined);
      // setPayoffMap(undefined);
      return;
    }

    const buyContracts = callOrPut === "Call" ? callContracts : putContracts;
    const sellContracts = callOrPut === "Call" ? binaryCallContracts : binaryPutContracts;
    const buyContractId = buyContracts[priceReference].contractId;
    const sellContractId = sellContracts[priceReference].contractId;

    const sellSpread =
      getNumber(callOrPutRemoteUnitPriceReference) / getNumber(binaryCallOrPutRemoteUnitPriceReference);
    const localMaxPotentialLoss = sellSpread.toFixed(2);

    const sellQuantity = (getNumber(multiplier) * getNumber(localMaxPotentialLoss)).toFixed(2);

    const buyLeg: Leg = { contractId: buyContractId, quantity: multiplier as `${number}`, side: "BUY" };
    const sellLeg: Leg = { contractId: sellContractId, quantity: `${sellQuantity}` as `${number}`, side: "SELL" };

    const order: ClientConditionalOrder = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: "0.0000",
      legs: [buyLeg, sellLeg],
    };

    const payoffMap = estimateOrderPayoff([
      {
        ...buyContracts[priceReference],
        ...buyLeg,
        premium: 1,
      },
      {
        ...sellContracts[priceReference],
        ...sellLeg,
        premium: 1 / getNumber(localMaxPotentialLoss),
      },
    ]);

    setPayoffMap(payoffMap);
    updateOrderDetails(order);
    setMaxPotentialLoss(localMaxPotentialLoss);
  };

  const updateOrderDetails = async (order: ClientConditionalOrder) => {
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
      console.error("Order estimation for No Gain, No Payin’ failed", error);
    }
  };

  useEffect(() => {
    handlePriceReferenceChange();
  }, [
    multiplier,
    maxPotentialLoss,
    priceReference,
    callOrPut,
    callOrPutRemoteUnitPriceReference,
    binaryCallOrPutRemoteUnitPriceReference,
    isLoadingBinaryCallOrPut,
    isLoadingCallOrPut,
  ]);

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

    setPositionBuilderStrategies(newPositionBuilderStrategies);
    setAuctionSubmission({
      order: orderDetails?.order,
      type: `No Gain, No Payin’ ${callOrPut}`,
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
    setMaxPotentialLoss("200");
    handleMultiplierChange("1");
  }, [currentExpiryDate]);

  const renderInstruction = () => {
    return (
      <>
        {!compact && showInstructions && (
          <NoGainNoPayinInstructions type={callOrPut} currentExpiryDate={currentExpiryDate.toString()} />
        )}
      </>
    );
  };

  return (
    <>
      {renderInstruction()}

      <Flex direction='column' margin={compact ? "mb-10" : "mb-17"} gap='gap-12'>
        <Flex
          classes={classNames("gap-24", {
            "mt-17": !compact,
          })}
        >
          {!compact && (
            <LabeledControl label='Type' labelClassName='mt-2'>
              <RadioButton
                labelClassName={radioButtonStyles.microLabels}
                size={compact ? "compact" : "regular"}
                width={compact ? 140 : 100}
                options={TYPE_OPTIONS}
                selectedOption={callOrPut}
                name={compact ? "callOrPutCompact" : "callOrPut"}
                onChange={value => handleCallOrPutChange(value as "Call" | "Put")}
              />
            </LabeledControl>
          )}
          {compact && (
            <RadioButton
              labelClassName={radioButtonStyles.microLabels}
              size={compact ? "compact" : "regular"}
              width={compact ? 140 : 100}
              options={TYPE_OPTIONS}
              selectedOption={callOrPut}
              name={compact ? "callOrPutCompact" : "callOrPut"}
              onChange={value => handleCallOrPutChange(value as "Call" | "Put")}
            />
          )}

          {!compact && (
            <>
              <LabeledControl label='Price Reference' icon={<LogoEth />}>
                <DropdownMenu
                  options={strikes}
                  width={isMobile ? 130 : undefined}
                  value={priceReference ? { name: priceReference, value: priceReference } : undefined}
                  onChange={value => {
                    setPriceReference(value);
                  }}
                />
              </LabeledControl>
              <LabeledControl label='Size (Multiplier)'>
                <Input
                  max={MAXIMUM_POSITION_SIZE}
                  type='number'
                  value={multiplier}
                  width={isMobile ? 130 : undefined}
                  onChange={({ target }) => handleMultiplierChange(target.value)}
                />
              </LabeledControl>

              <LabeledControl label={callOrPut === "Call" ? "Min Upside" : "Min Downside"}>
                <div className='color-white mt-16'>
                  {isLoadingCallOrPut || isLoadingBinaryCallOrPut ? <Loader /> : maxPotentialLoss}
                </div>
              </LabeledControl>

              <LabeledControl
                icon={<LogoEth />}
                label={
                  <div>
                    Breakeven Price
                    <div className='italic'>{`(Price Reference ${
                      callOrPut === "Call" ? " + Min Upside" : " - Min Downside"
                    })`}</div>
                  </div>
                }
                labelClassName='mb-10 mt--10 color-white'
              >
                <Flex>
                  <span className='fs-md-bold color-white ml-19'>
                    {priceReference && !isInvalidNumber(getNumber(maxPotentialLoss))
                      ? callOrPut === "Call"
                        ? toPrecision(getNumber(priceReference) + getNumber(maxPotentialLoss), currencyPrecision.strike)
                        : toPrecision(getNumber(priceReference) - getNumber(maxPotentialLoss), currencyPrecision.strike)
                      : ""}
                  </span>
                  <Asset icon={<LogoUsdc />} label='USDC' size='xs' />
                </Flex>
              </LabeledControl>
            </>
          )}
        </Flex>
      </Flex>

      <ChartPayoff
        id={`nogain-chart${compact ? "-compact" : ""}`}
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

export default NoGainNoPayin;
