// Packages
import { useEffect, useMemo, useState } from "react";

// SDK
import { ClientConditionalOrder, Leg } from "@ithaca-finance/sdk";
import { calculateNetPrice, createClientOrderId } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";

// Lib
import { useAppStore } from "@/UI/lib/zustand/store";

// Constants
import {
  PrepackagedStrategy,
  LINEAR_STRATEGIES,
  STRUCTURED_STRATEGIES,
  StrategyLeg,
} from "@/UI/constants/prepackagedStrategies";

// Utils
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";
import ReadyState from "@/UI/utils/ReadyState";

// Services
import mixPanel from "@/services/mixpanel";

// Components
import Meta from "@/UI/components/Meta/Meta";
import TableStrategy from "@/UI/components/TableStrategy/TableStrategy";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";
import Button from "@/UI/components/Button/Button";
import Plus from "@/UI/components/Icons/Plus";
import PayoffOutline from "@/UI/components/Icons/PayoffOutline";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import DynamicOptionRow from "@/UI/components/DynamicOptionRow/DynamicOptionRow";
import DropdownMenu from "@/UI/components/DropdownMenu/DropdownMenu";
import Minus from "@/UI/components/Icons/Minus";
import { Currency } from "@/UI/components/Currency";
import RadioButton from "@/UI/components/RadioButton/RadioButton";
import Toggle from "@/UI/components/Toggle/Toggle";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";

// Layouts
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import TradingLayout from "@/UI/layouts/TradingLayout/TradingLayout";
import Flex from "@/UI/layouts/Flex/Flex";
import Sidebar from "@/UI/layouts/Sidebar/Sidebar";
import Toast from "@/UI/components/Toast/Toast";

// Hooks
import { useDevice } from "@/UI/hooks/useDevice";

// Styles
import styles from "./dynamic-option-strategies.module.scss";

// Types
import { AuctionSubmission } from "../position-builder";
import { type OrderSummaryType } from "@/types/orderSummary";
import { SIDE } from "@/utils/types";

export interface DynamicOptionStrategy {
  leg: Leg;
  referencePrice: number;
  payoff: string;
  strike: string;
  product: string;
  side: SIDE;
  contractId: number;
  size: string;
  type: string;
}

type SectionType = {
  name: string;
  style: string;
};

const MAX_LEGS_COUNT = 5;

const sections: SectionType[] = [
  { name: "Product", style: styles.product },
  { name: "Type", style: styles.type },
  { name: "Side", style: styles.side },
  { name: "Size", style: styles.size },
  { name: "Strike", style: styles.strike },
  { name: "Unit Price", style: styles.unitPrice },
];

const Index = () => {
  const [orderSummary, setOrderSummary] = useState<OrderSummaryType | undefined>();
  const [chartData, setChartData] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const [strategy, setStrategy] = useState(LINEAR_STRATEGIES[0]);
  // Store
  const { ithacaSDK, currencyPrecision, getContractsByPayoff } = useAppStore();
  const { toastList, position, showOrderErrorToast, showOrderConfirmationToast } = useToast();
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();
  const [linkToggle, setLinkToggle] = useState<"right" | "left">("right");
  const [strategyType, setStrategyType] = useState<"LINEAR" | "STRUCTURED" | "-">("LINEAR");
  const [invertSide, setInvertSide] = useState("BUY");
  const device = useDevice();

  const canAddNewLeg = useMemo(() => {
    return strategy.strategies.length < MAX_LEGS_COUNT;
  }, [strategy.strategies]);

  const handleStrategyChange = (strat: string, type: "LINEAR" | "STRUCTURED") => {
    const newStrategy = (type === "LINEAR" ? LINEAR_STRATEGIES : STRUCTURED_STRATEGIES).find(
      s => s.key === strat
    ) as PrepackagedStrategy;
    if (newStrategy.key === strategy.key) return;
    setStrategyType(type);
    setOrderSummary(undefined);
    setChartData(undefined);
    const linkedCount = newStrategy.strategies.filter(s => s.linked).length;
    const areAllPositionsLinked = linkedCount === newStrategy.strategies.length;

    if (areAllPositionsLinked) {
      setLinkToggle("right");
    } else {
      setLinkToggle("left");
    }
    setInvertSide("BUY");
    setStrategy({
      ...{
        label: newStrategy?.label,
        key: newStrategy?.key,
        strategies: newStrategy ? [...newStrategy.strategies] : [],
      },
    });
  };

  const getOrderSummary = async () => {
    const legs = strategy.strategies.map(strat => {
      return {
        contractId: strat.contractId!,
        quantity: `${strat.size}` as `${number}`,
        side: strat.side,
      };
    });
    const referencePrices = strategy.strategies.map(strat => strat.referencePrice);

    const totalNetPrice = calculateNetPrice(legs, referencePrices, currencyPrecision.strike);
    const order = {
      clientOrderId: createClientOrderId(),
      totalNetPrice,
      legs,
    };

    try {
      const [orderLock, orderFees] = await Promise.all([
        ithacaSDK.calculation.estimateOrderLockPositioned(order),
        ithacaSDK.calculation.estimateOrderFees(order),
      ]);

      setOrderSummary({
        order,
        orderLock,
        orderFees,
      });
    } catch (error) {
      setOrderSummary({
        order,
        orderLock: null,
        orderFees: null,
      });
      console.error("Order estimation for position builder failed", error);
    }
  };

  useEffect(() => {
    const legs = strategy.strategies.map(strat => {
      return {
        contractId: strat.contractId,
        quantity: `${strat.size}`,
        side: strat.side,
      };
    });

    const referencePrices = strategy.strategies.map(strat => {
      return strat.referencePrice;
    });

    const strikes = strategy.strategies
      .map(strat => {
        return strat.strike;
      })
      .filter(Boolean);

    const payoffs = strategy.strategies.map(strat => {
      return strat.payoff;
    });

    if (legs.length) {
      const formattedLegs = strikes.map((strike, idx) => {
        const contracts = getContractsByPayoff(payoffs[idx]);
        return { ...contracts[strike], ...legs[idx], premium: referencePrices[idx] };
      });

      if (formattedLegs.length) {
        const chartTransformedData = estimateOrderPayoff(formattedLegs);
        setChartData(chartTransformedData);
      }

      getOrderSummary();
    }
  }, [strategy]);

  const handleStrategyUpdate = (updatedStrategy: StrategyLeg, index: number) => {
    // Save original size for later
    const originalOption = strategy.strategies[index];
    const originalOptionSize = originalOption.size;

    // Update current strategy to a changed one
    const newStrategy = { ...strategy };
    newStrategy.strategies[index] = updatedStrategy;

    // Check if all strategies are linked
    const areAllLinked = newStrategy.strategies.every(item => item.linked);

    // If all strategies are linked, update all to the same size
    if (areAllLinked) {
      const updatedSize = updatedStrategy.size;
      newStrategy.strategies = newStrategy.strategies.map(singleStrategy => {
        return {
          ...singleStrategy,
          size: updatedSize,
        };
      });
      setStrategy(newStrategy);
      return;
    }

    if (updatedStrategy.product === "option") {
      const updatedSize = updatedStrategy.size;

      newStrategy.strategies = newStrategy.strategies.map((singleStrategy, strategyIndex) => {
        if (singleStrategy.product === "digital-option" && index === strategyIndex) {
          return {
            ...singleStrategy,
            size: (singleStrategy.size / originalOptionSize) * updatedSize,
          };
        } else if (singleStrategy.product === "option" && index === strategyIndex) {
          return {
            ...singleStrategy,
            size: updatedSize,
          };
        }
        return singleStrategy;
      });
    } else if (updatedStrategy.product === "digital-option") {
      const updatedSize = updatedStrategy.size;

      newStrategy.strategies = newStrategy.strategies.map(singleStrategy => {
        if (singleStrategy.product === "digital-option") {
          return {
            ...singleStrategy,
            size: updatedSize,
          };
        }
        return singleStrategy;
      });
    }

    setStrategy(newStrategy);
  };

  const handleInvertSide = (side: string) => {
    const strats = strategy.strategies.map(strat => {
      return {
        ...strat,
        side: (strat.side === "BUY" ? "SELL" : "BUY") as SIDE,
      };
    });
    setInvertSide(side);
    setStrategy({
      ...strategy,
      strategies: [...strats],
    });
  };

  const handleLinkChange = (isLinked: boolean, index: number) => {
    if (isLinked) {
      const linkedCount = strategy.strategies.filter(s => s.linked).length;
      const areAllPositionsLinked = linkedCount + 1 === strategy.strategies.length;
      if (areAllPositionsLinked) setLinkToggle("right");
    } else {
      setLinkToggle("left");
    }
    strategy.strategies[index].linked = isLinked;
    setStrategy({ ...strategy });
  };

  const handleRemoveStrategy = (index: number) => {
    const newstrategies = [...strategy.strategies];
    newstrategies.splice(index, 1);
    setStrategy({
      ...strategy,
      strategies: newstrategies,
    });
    setStrategyType("-");
    // POINTS_EVENTS: Close position - service connected
    mixPanel.track("Close position");
  };

  const handleRemoveAllStrategies = () => {
    setStrategyType("-");
    setOrderSummary(undefined);
    setChartData(undefined);
    setStrategy({ ...strategy, strategies: [] });
  };

  const addPosition = () => {
    if (!canAddNewLeg) {
      return;
    }
    setStrategyType("-");
    let largestSize = 1;
    if (strategy.strategies.length) {
      largestSize = Math.max(...strategy.strategies.filter(s => s.linked).map(s => s.size));
    }

    setLinkToggle("left");
    setStrategy({
      ...strategy,
      strategies: [
        ...strategy.strategies,
        {
          product: "option",
          type: "Call",
          payoff: "Call",
          side: SIDE.BUY,
          size: largestSize,
          strikeIndex: 0,
          strike: "",
          contractId: 0,
          referencePrice: 0,
          linked: false,
        },
      ],
    });
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

  const handleLinkAllToggle = (side: "left" | "right") => {
    const largestSize = Math.max(...strategy.strategies.map(s => s.size));
    const newStrats = strategy.strategies.map(s => {
      const isLinked = side === "right";

      return {
        ...s,
        linked: isLinked,
        size: isLinked ? largestSize : s.size,
      };
    });

    setStrategy({ ...strategy, strategies: newStrats });
  };

  const getStrategiesFormatted = () => {
    return strategy.strategies.map((strat, idx) => {
      return {
        leg: {
          contractId: strat.contractId,
          quantity: `${strat.size}` as `${number}`,
          side: strat.side,
        },
        referencePrice: strat.referencePrice,
        payoff: strat.payoff,
        strike: strat.strike,
      };
    });
  };

  return (
    <>
      <Meta />
      <Main>
        <Container>
          <ReadyState>
            <TradingLayout />
            <Sidebar
              leftPanel={
                <>
                  <Currency
                    onExpiryChange={() => {
                      setOrderSummary(undefined);
                      setChartData(undefined);
                    }}
                  />
                  {device !== "desktop" ? (
                    <div className={styles.moduleHeader}>
                      <h3 className='mb-0 mt-20'>Dynamic Option Strategies</h3>
                      <Toggle
                        defaultState={linkToggle}
                        size='sm'
                        rightLabel='Link all'
                        rightLabelClass='link-icon'
                        onChange={handleLinkAllToggle}
                      />
                    </div>
                  ) : (
                    <h3 className='mt-20'>Dynamic Option Strategies</h3>
                  )}
                  <div className='mb-24'>
                    <Flex direction='row-space-between'>
                      <Flex gap='gap-32'>
                        <div className={styles.prePackagedContainer}>
                          <div className={styles.prePackagedTitle}>Linear Combinations</div>
                          <div className={styles.dropDownWrapper}>
                            <DropdownMenu
                              width={145}
                              size='sm'
                              value={
                                strategyType === "LINEAR"
                                  ? {
                                      name: strategy.label,
                                      value: strategy.key,
                                    }
                                  : {
                                      name: "-",
                                      value: "",
                                    }
                              }
                              options={LINEAR_STRATEGIES.map(strat => {
                                return {
                                  name: strat.label,
                                  value: strat.key,
                                };
                              })}
                              onChange={option => handleStrategyChange(option, "LINEAR")}
                            />
                          </div>
                        </div>
                        <div className={styles.prePackagedContainer}>
                          <div className={styles.prePackagedTitle}>Structured Products</div>
                          <div className={styles.dropDownWrapper}>
                            <DropdownMenu
                              width={145}
                              size='sm'
                              value={
                                strategyType === "STRUCTURED"
                                  ? {
                                      name: strategy.label,
                                      value: strategy.key,
                                    }
                                  : {
                                      name: "-",
                                      value: "",
                                    }
                              }
                              options={STRUCTURED_STRATEGIES.map(strat => {
                                return {
                                  name: strat.label,
                                  value: strat.key,
                                };
                              })}
                              onChange={option => handleStrategyChange(option, "STRUCTURED")}
                            />
                          </div>
                        </div>
                      </Flex>
                      {device === "desktop" && (
                        <Flex gap='gap-12'>
                          <Toggle
                            defaultState={linkToggle}
                            size='sm'
                            rightLabel='Link all'
                            rightLabelClass='link-icon'
                            onChange={handleLinkAllToggle}
                          />
                          <Flex gap='gap-8' direction='row-space-between'>
                            <RadioButton
                              options={[
                                { option: <Plus />, value: "BUY" },
                                { option: <Minus />, value: "SELL" },
                              ]}
                              size='vertical-compact'
                              width={24}
                              selectedOption={invertSide}
                              name='invert-side'
                              orientation='vertical'
                              onChange={value => handleInvertSide(value)}
                            />
                            <span className='color-white fs-xs'>Invert Side</span>
                          </Flex>
                        </Flex>
                      )}
                    </Flex>
                  </div>
                  <div className={styles.strategiesWrapper}>
                    {strategy.strategies.length ? (
                      <>
                        <div className={styles.parent}>
                          {device === "desktop" && (
                            <>
                              {sections.map((section, index) => (
                                <div key={index} className={section.style}>
                                  <p>{section.name}</p>
                                </div>
                              ))}
                              <div className={styles.action}></div>
                            </>
                          )}
                        </div>
                        {strategy.strategies.map((strat, index) => {
                          return (
                            <DynamicOptionRow
                              id={`strategy-${index}-${strategy.key}`}
                              key={`strategy-${index}-${strategy.key}`}
                              strategy={strat}
                              linked={strat.linked}
                              optionChange={() => {
                                setStrategyType("-");
                              }}
                              linkChange={isLinked => handleLinkChange(isLinked, index)}
                              updateStrategy={stratInternal => handleStrategyUpdate(stratInternal, index)}
                              removeStrategy={() => handleRemoveStrategy(index)}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <div className={styles.strategiesPlaceholder}></div>
                    )}
                    <div className={styles.buttonWrapper}>
                      <Button
                        disabled={!canAddNewLeg}
                        title='Click to add Position '
                        size='sm'
                        variant='secondary'
                        onClick={() => addPosition()}
                      >
                        <Plus /> Add Position
                      </Button>
                      {strategy.strategies.length > 0 && (
                        <Button
                          className={styles.clearAll}
                          title='Click to clear all'
                          onClick={handleRemoveAllStrategies}
                          variant='clear'
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              }
              orderSummary={
                <>
                  <OrderSummary
                    orderSummary={orderSummary}
                    submitAuction={() => {
                      if (!orderSummary) return;
                      setSubmitModal(true);
                      setAuctionSubmission({
                        order: orderSummary?.order,
                        type: strategyType === "-" ? "Position Builder" : strategy.label,
                      });
                    }}
                  />
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
                    positionBuilderStrategies={getStrategiesFormatted()}
                    orderSummary={orderSummary}
                  />
                  <Toast toastList={toastList} position={position} />
                </>
              }
              rightPanel={
                <>
                  <h3 className='mb-13'>Strategy</h3>
                  <TableStrategy
                    strategies={getStrategiesFormatted()}
                    removeRow={(index: number) => {
                      handleRemoveStrategy(index);
                    }}
                    clearAll={handleRemoveAllStrategies}
                  />
                  {chartData ? (
                    <ChartPayoff chartData={chartData} height={210} id='dynamic-chart' />
                  ) : (
                    <>
                      <h3>Payoff Diagram</h3>
                      <div className={styles.tableWrapper}>
                        <PayoffOutline />
                      </div>
                    </>
                  )}
                </>
              }
            />
          </ReadyState>
        </Container>
      </Main>
    </>
  );
};

export default Index;
