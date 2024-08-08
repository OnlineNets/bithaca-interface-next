/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import React, { useEffect, useState } from "react";
import { TradingStoriesProps } from "../../TradingStories";
import { PositionBuilderStrategy, AuctionSubmission } from "@/pages/trading/position-builder";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import Input from "@/UI/components/Input/Input";
import LogoEth from "@/UI/components/Icons/LogoEth";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import Toast from "@/UI/components/Toast/Toast";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";

// Utils
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";
import { getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { Leg, ClientConditionalOrder, createClientOrderId, calculateNetPrice } from "@ithaca-finance/sdk";
import LabeledControl from "../../LabeledControl/LabeledControl";
import { SIDE_OPTIONS } from "@/UI/constants/options";
import useToast from "@/UI/hooks/useToast";
import { useDevice } from "@/UI/hooks/useDevice";
import ForwardInstructions from "../../Instructions/ForwardInstructions";
import OrderSummary from "../../OrderSummary/OrderSummary";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
import { usePrice } from "@/services/pricing/usePrice";
import { OrderSummaryType } from "@/types/orderSummary";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

const Forwards = ({ showInstructions, compact, chartHeight }: TradingStoriesProps) => {
  const { ithacaSDK, currencyPrecision, currentExpiryDate, getContractsByPayoff, spotContract } = useAppStore();
  const device = useDevice();
  const currentForwardContract = getContractsByPayoff("Forward")["-"];
  const nextAuctionForwardContract = spotContract;

  const [currentOrNextAuction, setCurrentOrNextAuction] = useState<"CURRENT" | "NEXT_AUCTION">("CURRENT");
  const [buyOrSell, setBuyOrSell] = useState<"BUY" | "SELL">("BUY");
  const [size, setSize] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();

  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();

  const { unitPrice: remoteUnitPriceReference, isLoading: isUnitPriceLoading } = usePrice({
    isForward: true,
    optionType: currentOrNextAuction,
    expiryDate: currentExpiryDate,
    strike: "-",
    side: buyOrSell,
  });

  useEffect(() => {
    setUnitPrice(remoteUnitPriceReference);
  }, [remoteUnitPriceReference, currentExpiryDate, currentOrNextAuction]);

  useEffect(() => {
    handleStrikeChange(currentOrNextAuction, buyOrSell, getNumber(size), unitPrice);
  }, [currentOrNextAuction, buyOrSell, size, unitPrice]);

  const handleCurrentOrNextAuctionChange = async (currentOrNextAuction: "CURRENT" | "NEXT_AUCTION") => {
    setCurrentOrNextAuction(currentOrNextAuction);
  };

  const handleBuyOrSellChange = async (buyOrSell: "BUY" | "SELL") => {
    setBuyOrSell(buyOrSell);
  };

  const handleSizeChange = async (amount: string) => {
    const size = getNumberValue(amount);
    setSize(size);
  };

  const handleUnitPriceChange = async (amount: string) => {
    const unitPrice = getNumberValue(amount);
    setUnitPrice(unitPrice);
  };

  const handleStrikeChange = async (
    currentOrNextAuction: "CURRENT" | "NEXT_AUCTION",
    buyOrSell: "BUY" | "SELL",
    size: number,
    unitPrice: string
  ) => {
    if (isInvalidNumber(size) || isInvalidNumber(Number(unitPrice))) {
      setOrderDetails(undefined);
      setPayoffMap(undefined);
      return;
    }

    const contract = currentOrNextAuction === "CURRENT" ? currentForwardContract : nextAuctionForwardContract;
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
      console.error(`Order estimation for forward failed`, error);
    }
  };

  const handleSubmit = async () => {
    if (!orderDetails) return;
    if (orderDetails)
      setAuctionSubmission({
        order: orderDetails?.order,
        type: currentOrNextAuction === "CURRENT" ? "Forward" : "Next Auction Forward",
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
  }, []);

  const renderInstruction = () => {
    return <>{!compact && showInstructions && <ForwardInstructions />}</>;
  };

  return (
    <>
      {renderInstruction()}
      {!compact && (
        <Flex direction='row' margin={`${compact ? "mb-12" : "mb-34"}`} gap='gap-12'>
          <LabeledControl label='Type'>
            <RadioButton
              width={200}
              options={[
                { option: "Next Auction", value: "NEXT_AUCTION" },
                {
                  option: formatDate(`${currentExpiryDate}`, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT),
                  value: "CURRENT",
                },
              ]}
              name={compact ? "currentOrNextAuctionCompact" : "currentOrNextAuction"}
              selectedOption={currentOrNextAuction}
              onChange={value => handleCurrentOrNextAuctionChange(value as "CURRENT" | "NEXT_AUCTION")}
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

          <LabeledControl label='Unit Price'>
            <Input
              isLoading={isUnitPriceLoading}
              type='number'
              icon={<LogoUsdc />}
              value={unitPrice}
              width={110}
              onChange={({ target }) => handleUnitPriceChange(target.value)}
            />
          </LabeledControl>
        </Flex>
      )}

      <Toast toastList={toastList} position={position} />

      <ChartPayoff
        // id='forwards-chart'
        id={`forwards-chart${compact ? "-compact" : ""}`}
        compact={compact}
        chartData={payoffMap ?? CHART_FAKE_DATA}
        height={chartHeight}
        showKeys={false}
        showPortial={!compact && payoffMap !== undefined}
        showProfitLoss={false}
        caller='Forwards'
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
              {
                leg: orderDetails.order.legs[0],
                referencePrice: unitPrice,
                payoff:
                  currentOrNextAuction === "CURRENT"
                    ? `Forward (${formatDate(
                        `${currentExpiryDate}`,
                        DEFAULT_INPUT_DATE_FORMAT,
                        DEFAULT_OUTPUT_DATE_FORMAT
                      )})`
                    : "Forward (Next Auction)",
              },
            ] as unknown as PositionBuilderStrategy[]
          }
          orderSummary={orderDetails}
        />
      )}
      {!compact && <OrderSummary asContainer={false} orderSummary={orderDetails} submitAuction={handleSubmit} />}
    </>
  );
};

export default Forwards;
