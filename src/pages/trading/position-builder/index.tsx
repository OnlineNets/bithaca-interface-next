// Packages
import { useState } from "react";

// SDK
import { ClientConditionalOrder, Leg, calculateNetPrice, createClientOrderId } from "@ithaca-finance/sdk";
import useToast from "@/UI/hooks/useToast";

// Lib
import { useAppStore } from "@/UI/lib/zustand/store";

// Components
import Meta from "@/UI/components/Meta/Meta";
import TableStrategy from "@/UI/components/TableStrategy/TableStrategy";
import OrderSummary from "@/UI/components/OrderSummary/OrderSummary";
import ChartPayoff from "@/UI/components/ChartPayoff/ChartPayoff";
import PayoffOutline from "@/UI/components/Icons/PayoffOutline";
import Toast from "@/UI/components/Toast/Toast";

// Layouts
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";
import TradingLayout from "@/UI/layouts/TradingLayout/TradingLayout";
import Sidebar from "@/UI/layouts/Sidebar/Sidebar";

// Utils
import { PayoffMap, estimateOrderPayoff } from "@/UI/utils/CalcChartPayoff";
import ReadyState from "@/UI/utils/ReadyState";

// Styles
import styles from "./position-builder.module.scss";
import SubmitModal from "@/UI/components/SubmitModal/SubmitModal";
import MainInfo from "./MainInfo";
import { Currency } from "@/UI/components/Currency";
import { OrderSummaryType } from "@/types/orderSummary";

// Types
export interface PositionBuilderStrategy {
  leg: Leg;
  referencePrice: number;
  payoff: string;
  strike: string;
}

export type AuctionSubmission = {
  type: string;
  order: ClientConditionalOrder;
};

const Index = () => {
  // State
  const [positionBuilderStrategies, setPositionBuilderStrategies] = useState<PositionBuilderStrategy[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryType>();
  const [chartData, setChartData] = useState<PayoffMap[]>();
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();
  const { toastList, position, showOrderConfirmationToast, showOrderErrorToast } = useToast();

  // Store
  const { ithacaSDK, currencyPrecision, getContractsByPayoff, spotContract } = useAppStore();

  const getPositionBuilderSummary = async (positionBuilderStrategies: PositionBuilderStrategy[]) => {
    const { legs, referencePrices, strikes, payoffs } = positionBuilderStrategies.reduce<{
      legs: Leg[];
      referencePrices: number[];
      strikes: string[];
      payoffs: string[];
    }>(
      (strategies, currStrategy) => {
        strategies.legs = [...strategies.legs, currStrategy.leg];
        strategies.referencePrices = [...strategies.referencePrices, currStrategy.referencePrice];
        strategies.strikes = [...strategies.strikes, currStrategy.strike];
        strategies.payoffs = [...strategies.payoffs, currStrategy.payoff];
        return strategies;
      },
      { legs: [], referencePrices: [], strikes: [], payoffs: [] }
    );
    const totalNetPrice = calculateNetPrice(legs, referencePrices, currencyPrecision.strike);
    const order = {
      clientOrderId: createClientOrderId(),
      totalNetPrice,
      legs,
    };

    const chartData = estimateOrderPayoff(
      strikes.map((strike, idx) => {
        const contracts = payoffs[idx] === "NEXT_AUCTION" ? spotContract : getContractsByPayoff(payoffs[idx])[strike];
        return {
          ...contracts,
          ...legs[idx],
          premium: payoffs[idx] === "NEXT_AUCTION" ? spotContract.referencePrice : referencePrices[idx],
        };
      })
    );
    setChartData(chartData);

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
  const handleAddStrategy = (strategy: PositionBuilderStrategy) => {
    const newPositionBuilderStrategies = [...positionBuilderStrategies, strategy];
    setPositionBuilderStrategies(newPositionBuilderStrategies);
    getPositionBuilderSummary(newPositionBuilderStrategies);
  };

  const handleClearAll = () => {
    setPositionBuilderStrategies([]);
    setOrderSummary(undefined);
    setChartData(undefined);
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
                      setPositionBuilderStrategies([]);
                      setChartData(undefined);
                    }}
                  />
                  <MainInfo handleAddStrategy={handleAddStrategy} />
                </>
              }
              orderSummary={
                <>
                  <OrderSummary
                    orderSummary={orderSummary}
                    submitAuction={() => {
                      if (orderSummary?.order) {
                        setSubmitModal(true);
                        setAuctionSubmission({
                          order: orderSummary?.order,
                          type: "Position Builder",
                        });
                      }
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
                    positionBuilderStrategies={positionBuilderStrategies}
                    orderSummary={orderSummary}
                  />
                  <Toast toastList={toastList} position={position} />
                </>
              }
              rightPanel={
                <>
                  <h3 className='mb-13'>Strategy</h3>
                  <TableStrategy
                    strategies={positionBuilderStrategies}
                    clearAll={handleClearAll}
                    removeRow={(index: number) => {
                      const newPositionBuilderStrategies = [...positionBuilderStrategies];
                      newPositionBuilderStrategies.splice(index, 1);
                      if (!newPositionBuilderStrategies.length) {
                        setPositionBuilderStrategies([]);
                        setOrderSummary(undefined);
                        setChartData(undefined);
                      } else {
                        setPositionBuilderStrategies(newPositionBuilderStrategies);
                        getPositionBuilderSummary(newPositionBuilderStrategies);
                      }
                    }}
                  />

                  {chartData ? (
                    <ChartPayoff chartData={chartData} height={210} id='position-chart' />
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
