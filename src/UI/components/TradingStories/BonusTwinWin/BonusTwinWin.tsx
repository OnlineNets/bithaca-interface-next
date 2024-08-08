/* eslint-disable react-hooks/exhaustive-deps */
// Packages
import React, { useEffect, useState } from "react";
import { TradingStoriesProps } from "..";
import { PositionBuilderStrategy, AuctionSubmission } from "@/pages/trading/position-builder";

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Components
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import Input from "@/UI/components/Input/Input";
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import LabeledControl from "@/UI/components/LabeledControl/LabeledControl";
import Toast from "@/UI/components/Toast/Toast";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";

// Constants
import { CHART_FAKE_DATA } from "@/UI/constants/charts/charts";
import { BONUS_TWIN_WIN_OPTIONS } from "@/UI/constants/options";

// Utils
import { getNumber, getNumberValue, isInvalidNumber } from "@/UI/utils/Numbers";
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";

// SDK
import { useAppStore } from "@/UI/lib/zustand/store";
import { ClientConditionalOrder, Leg, createClientOrderId } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import BonusInstructions from "@/UI/components/Instructions/BonusInstructions";
import TwinWinInstructions from "../../Instructions/TwinWinInstructions";
import LogoEth from "../../Icons/LogoEth";
import { DESCRIPTION_OPTIONS, TITLE_OPTIONS } from "@/UI/constants/tabCard";

//Styles
import radioButtonStyles from "@/UI/components/RadioButton/RadioButton.module.scss";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { MOBILE_BREAKPOINT } from "@/UI/constants/breakpoints";
import { fetchPriceForUnit } from "@/services/pricing/calcPrice.api.service";
import { OrderSummaryType } from "@/types/orderSummary";
import { calculateBidAsk } from "@/services/pricing/helpers";
import { MAXIMUM_POSITION_SIZE } from "@/UI/utils/constants";

const BonusTwinWin = ({
  showInstructions,
  compact,
  chartHeight,
  radioChosen = "Bonus",
  onRadioChange,
}: TradingStoriesProps) => {
  const {
    ithacaSDK,
    currentSpotPrice,
    getContractsByPayoff,
    unFilteredContractList,
    currentExpiryDate,
    quotingParams,
  } = useAppStore();
  const forwardContracts = getContractsByPayoff("Forward");
  const putContracts = getContractsByPayoff("Put");
  const binaryPutContracts = getContractsByPayoff("BinaryPut");
  const barrierStrikes = putContracts
    ? Object.keys(putContracts).reduce<string[]>((strikes, currStrike) => {
        if (parseFloat(currStrike) < currentSpotPrice) strikes.push(currStrike);
        return strikes;
      }, [])
    : [];
  const barrier = barrierStrikes[barrierStrikes.length - 3];
  const referenceList = putContracts
    ? Object.keys(putContracts).reduce<string[]>((strikes, currStrike) => {
        if (parseFloat(currStrike) > Number(barrier)) strikes.push(currStrike);
        return strikes;
      }, [])
    : [];

  const [priceReferenceStrikes, setPriceReferenceStrikes] = useState(referenceList);
  const [priceReference, setPriceReference] = useState<string>(referenceList[1]);
  const [bonusOrTwinWin, setBonusOrTwinWin] = useState<"Bonus" | "Twin Win">((radioChosen as "Bonus") || "Bonus");
  const [koBarrier, setKoBarrier] = useState<string>(barrier);
  const [multiplier, setMultiplier] = useState("");
  // TODO: Needs to be hooked up to price server instead of hard coded
  const [price, setPrice] = useState("");
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [orderDetails, setOrderDetails] = useState<OrderSummaryType>();
  const [payoffMap, setPayoffMap] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();
  const [positionBuilderStrategies, setPositionBuilderStrategies] = useState<PositionBuilderStrategy[]>([]);

  useEffect(() => {
    if (radioChosen) {
      handleBonusOrTwinWinChange(radioChosen as "Bonus" | "Twin Win");
    }
  }, [radioChosen]);

  const handlePRChange = (priceReference: string) => {
    setPriceReference(priceReference);
    if (!koBarrier) return;
    handlePriceReferenceChange(bonusOrTwinWin, priceReference, koBarrier, getNumber(multiplier), getNumber(price));
  };

  const handleBonusOrTwinWinChange = (bonusOrTwinWin: "Bonus" | "Twin Win") => {
    setBonusOrTwinWin(bonusOrTwinWin);
    if (onRadioChange) onRadioChange(DESCRIPTION_OPTIONS[bonusOrTwinWin], TITLE_OPTIONS[bonusOrTwinWin]);
    if (!koBarrier) return;
    handlePriceReferenceChange(bonusOrTwinWin, priceReference, koBarrier, getNumber(multiplier), getNumber(price));
  };

  const handleMultiplierChange = (amount: string) => {
    const multiplier = getNumberValue(amount);
    setMultiplier(multiplier);
    if (!koBarrier) return;
    handlePriceReferenceChange(bonusOrTwinWin, priceReference, koBarrier, getNumber(multiplier), getNumber(price));
  };

  const handleKOBarrierChange = (koBarrier: string) => {
    setKoBarrier(koBarrier);
    const strikes = putContracts
      ? Object.keys(putContracts).reduce<string[]>((strikes, currStrike) => {
          if (parseFloat(currStrike) > Number(koBarrier)) strikes.push(currStrike);
          return strikes;
        }, [])
      : [];
    setPriceReferenceStrikes(strikes);
    if (Number(priceReference) < Number(koBarrier)) setPriceReference(strikes[0]);
    handlePriceReferenceChange(bonusOrTwinWin, priceReference, koBarrier, getNumber(multiplier), getNumber(price));
  };

  // const handlePriceChange = (price: string) => {
  //   setPrice(price);
  //   if (!koBarrier) return;
  //   handlePriceReferenceChange(bonusOrTwinWin, priceReference, koBarrier, getNumber(multiplier), getNumber(price));
  // };

  const handlePriceReferenceChange = async (
    bonusOrTwinWin: "Bonus" | "Twin Win",
    priceReference: string,
    koBarrier: string,
    multiplier: number,
    price: number
  ) => {
    if (isInvalidNumber(multiplier)) {
      setOrderDetails(undefined);
      setPayoffMap(undefined);
      return;
    }
    //TODO: Add logic here to update the price on KO Barrier or price reference change
    const isTwinWin = bonusOrTwinWin === "Twin Win";
    const priceBarrierDiff = getNumber(priceReference) - getNumber(koBarrier);
    const buyForwardContract = forwardContracts["-"];
    const buyPutContract = putContracts[priceReference];
    const sellPutContract = putContracts[koBarrier];
    const sellBinaryPutContract = binaryPutContracts[koBarrier];

    const buyForwardLeg: Leg = {
      contractId: buyForwardContract.contractId,
      quantity: `${multiplier}`,
      side: "BUY",
    };

    const buyPutLeg: Leg = {
      contractId: buyPutContract.contractId,
      quantity: `${isTwinWin ? 2 * multiplier : multiplier}`,
      side: "BUY",
    };

    const sellPutLeg: Leg = {
      contractId: sellPutContract.contractId,
      quantity: `${isTwinWin ? 2 * multiplier : multiplier}`,
      side: "SELL",
    };

    const sellBinaryPutLeg: Leg = {
      contractId: sellBinaryPutContract.contractId,
      quantity: `${isTwinWin ? 2 * multiplier * priceBarrierDiff : multiplier * priceBarrierDiff}`,
      side: "SELL",
    };

    const legs = [buyForwardLeg, buyPutLeg, sellPutLeg, sellBinaryPutLeg];

    const [
      sellBinaryPutContractBarrierPriceReference,
      buyForwardContractPriceReference,
      buyPutContractPriceReference,
      sellPutContractBarrierPriceReference,
    ] = await Promise.all([
      fetchPriceForUnit({
        isForward: false,
        optionType: "BinaryPut",
        expiryDate: currentExpiryDate,
        strike: koBarrier,
        side: "SELL",
        forcedSpread: quotingParams.DIGITAL_SPREAD,
        currentSpotPrice: currentSpotPrice,
      }),
      fetchPriceForUnit({
        isForward: true,
        optionType: "Forward",
        expiryDate: currentExpiryDate,
        strike: "-",
        side: "BUY",
        forcedSpread: quotingParams.DIGITAL_SPREAD,
        currentSpotPrice: currentSpotPrice,
      }),
      fetchPriceForUnit({
        isForward: false,
        optionType: "Put",
        expiryDate: currentExpiryDate,
        strike: priceReference,
        side: "BUY",
        forcedSpread: quotingParams.DIGITAL_SPREAD,
        currentSpotPrice: currentSpotPrice,
      }),
      fetchPriceForUnit({
        isForward: false,
        optionType: "Put",
        expiryDate: currentExpiryDate,
        strike: koBarrier,
        side: "SELL",
        forcedSpread: quotingParams.DIGITAL_SPREAD,
        currentSpotPrice: currentSpotPrice,
      }),
    ]);
    const buyForwardPrice = buyForwardContractPriceReference
      ? getNumber(buyForwardContractPriceReference)
      : calculateBidAsk({
          midPrice: Number(buyForwardContract.referencePrice),
          optionType: "Forward",
          side: "BUY",
          forcedSpread: quotingParams.DIGITAL_SPREAD,
          currentSpotPrice: currentSpotPrice,
        });

    const buyPutPrice = buyPutContractPriceReference
      ? getNumber(buyPutContractPriceReference)
      : calculateBidAsk({
          midPrice: Number(buyPutContract.referencePrice),
          optionType: "Put",
          side: "BUY",
          forcedSpread: quotingParams.DIGITAL_SPREAD,
          currentSpotPrice: currentSpotPrice,
        });

    const sellPutPrice = sellPutContractBarrierPriceReference
      ? getNumber(sellPutContractBarrierPriceReference)
      : calculateBidAsk({
          midPrice: Number(sellPutContract.referencePrice),
          optionType: "Put",
          side: "SELL",
          forcedSpread: quotingParams.DIGITAL_SPREAD,
          currentSpotPrice: currentSpotPrice,
        });

    const sellBinaryPutPrice = sellBinaryPutContractBarrierPriceReference
      ? getNumber(sellBinaryPutContractBarrierPriceReference)
      : calculateBidAsk({
          midPrice: Number(sellBinaryPutContract.referencePrice),
          optionType: "BinaryPut",
          side: "SELL",
          forcedSpread: quotingParams.DIGITAL_SPREAD,
          currentSpotPrice: currentSpotPrice,
        });
    const payoffMap = estimateOrderPayoff(
      [
        {
          ...buyForwardContract,
          ...buyForwardLeg,
          premium: buyForwardPrice,
        },
        {
          ...buyPutContract,
          ...buyPutLeg,
          premium: buyPutPrice,
        },
        {
          ...sellPutContract,
          ...sellPutLeg,
          premium: sellPutPrice,
        },
        {
          ...sellBinaryPutContract,
          ...sellBinaryPutLeg,
          premium: sellBinaryPutPrice,
        },
      ],
      {
        min: Number(koBarrier) - 300,
        max: Number(priceReference) + 300,
      }
    );
    const totalPrice = buyForwardPrice + buyPutPrice - sellPutPrice - sellBinaryPutPrice * priceBarrierDiff;
    setPrice(Math.round(totalPrice).toString());
    setPayoffMap(payoffMap);

    const order = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: `${totalPrice}`,
      legs,
    } as ClientConditionalOrder;
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
      console.error(`Order estimation for ${bonusOrTwinWin} failed`, error);
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
      } as unknown as PositionBuilderStrategy;
    });

    setPositionBuilderStrategies(newPositionBuilderStrategies);
    setAuctionSubmission({
      order: orderDetails?.order,
      type: bonusOrTwinWin,
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
    handleMultiplierChange("1");
  }, [currentExpiryDate]);

  return (
    <>
      {compact && (
        <Flex margin={compact ? "mb-10" : "mb-12"}>
          <RadioButton
            labelClassName={radioButtonStyles.microLabels}
            size={compact ? "compact" : "regular"}
            width={compact ? 140 : 186}
            options={BONUS_TWIN_WIN_OPTIONS}
            selectedOption={bonusOrTwinWin}
            name={compact ? "bonusOrTwinWinCompact" : "bonusOrTwinWin"}
            onChange={value => handleBonusOrTwinWinChange(value as "Bonus" | "Twin Win")}
          />
        </Flex>
      )}

      {!compact && showInstructions && (bonusOrTwinWin === "Bonus" ? <BonusInstructions /> : <TwinWinInstructions />)}

      {!compact && (
        <Flex direction='row' margin='mt-20 mb-14' gap='gap-15'>
          <LabeledControl label='Price Reference'>
            <DropdownMenu
              width={isMobile ? 135 : 80}
              options={priceReferenceStrikes.map(strike => ({ name: strike, value: strike }))}
              value={{ name: priceReference, value: priceReference }}
              onChange={handlePRChange}
            />
          </LabeledControl>
          <LabeledControl label='KO Barrier'>
            <DropdownMenu
              width={isMobile ? 135 : undefined}
              options={barrierStrikes.map(strike => ({ name: strike, value: strike }))}
              value={koBarrier ? { name: koBarrier, value: koBarrier } : undefined}
              onChange={handleKOBarrierChange}
            />
          </LabeledControl>
          {/* <Flex direction='row-center' gap='gap-4' margin='mt-22'>
              <LogoEth />
              <p className='fs-sm mr-10'>Protection Cost Inclusive</p>
            </Flex> */}
          <LabeledControl label='Size (Multiplier)'>
            <Input
              max={MAXIMUM_POSITION_SIZE}
              type='number'
              width={isMobile ? 135 : undefined}
              value={multiplier}
              onChange={({ target }) => handleMultiplierChange(target.value)}
            />
          </LabeledControl>
          <LabeledControl
            label={
              isMobile ? (
                <Flex classes='items-center mt--10'>
                  <LogoEth />{" "}
                  <div className='ml-6'>
                    <div>Protection Cost</div>
                    <div> Inclusive Price</div>
                  </div>
                </Flex>
              ) : (
                <>
                  <LogoEth /> Protection Cost Inclusive Price
                </>
              )
            }
            labelClassName='nowrap mb-14'
          >
            <span className='fs-md-bold color-white ml-19'>{price}</span>
          </LabeledControl>

          {/* <LabeledControl label='Total Cost' labelClassName='color-white mb-16'>
              <Flex gap='gap-10'>
                <span className='fs-md-bold color-white'>
                  {!isInvalidNumber(getNumber(total)) ? getNumber(total).toFixed(0) : "-"}
                </span>
                <Asset icon={<LogoUsdc />} label='USDC' size='xs' />
              </Flex>
            </LabeledControl> */}
        </Flex>
      )}

      <ChartPayoff
        // id='bonus-chart'
        id={`bonus-chart${compact ? "-compact" : ""}`}
        compact={compact}
        chartData={payoffMap ?? CHART_FAKE_DATA}
        height={chartHeight}
        showKeys={false}
        showPortial={!compact && payoffMap !== undefined}
        infoPopup={
          payoffMap !== undefined
            ? {
                type: bonusOrTwinWin === "Bonus" ? "bonus" : "twinWin",
                price: price,
                barrier: koBarrier,
                strike: priceReference,
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

      {!compact && <OrderSummary asContainer={false} orderSummary={orderDetails} submitAuction={handleSubmit} />}

      <Toast toastList={toastList} position={position} />
    </>
  );
};

export default BonusTwinWin;
