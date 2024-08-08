import React, { Dispatch, SetStateAction, useEffect } from "react";
import styles from "./CrossChainStatusPanel.module.scss";
import Panel from "@/UI/layouts/Panel/Panel";
import ModalClose from "../Icons/ModalClose";
import Button from "../Button/Button";
import { useAppStore } from "@/UI/lib/zustand/store";
import { GetStatusResponse } from "@ithaca-finance/sdk";
import { formatDate } from "@/UI/utils/DateFormatting";
import dayjs from "dayjs";
import ArrowUpRight from "../Icons/ArrowUpRight";

const expressSteps = ["Sent", "Gas Paid", "Express Executed"];
const normalSteps = ["Sent", "Gas Paid", "Confirmed", "Approved", "Executed"];

const txnStatusResponses: { [status: string]: number } = {
  source_gateway_called_gas_unpaid: 0,
  source_gateway_called_gas_paid: 1,
  express_executed: 2,
  confirmed: 3,
  approved: 4,
  destination_executed: 5,
};

const TransactionStatus = () => {
  const { ithacaSDK, crossChainTransactions, updateCrossChainTxnStatus } = useAppStore();

  useEffect(() => {
    if (!crossChainTransactions.length) return;
    const interval = setInterval(async () => {
      const crossChainTxnStatusPromises = crossChainTransactions.map(({ status }) => {
        if (status.status === "destination_executed") return Promise.resolve(status);
        return ithacaSDK.fundlock.getCrossChainTxStatus(status.fromChain.transactionId);
      });
      const crossChainTxnStatus = await Promise.all<GetStatusResponse>(crossChainTxnStatusPromises);
      const crossChainTxns = crossChainTransactions.map(({ route, timestamp }, index) => ({
        route,
        status: crossChainTxnStatus[index],
        timestamp,
      }));
      updateCrossChainTxnStatus(crossChainTxns);
    }, 10_000);

    return () => clearInterval(interval);
  }, [crossChainTransactions, ithacaSDK, updateCrossChainTxnStatus]);

  return crossChainTransactions.map(({ route, status, timestamp }) => (
    <div key={status.id} className={styles.transactionStatusContainer}>
      <div className={styles.header}>
        <h4
          className={styles.title}
        >{`Cross-Chain Deposit Status (${route.params.fromToken.symbol}/${route.params.toToken.symbol})`}</h4>
        <div className={styles.timestamp}>
          <span>{formatDate(timestamp, undefined, "DDMMMYY")}</span>
          <span>{dayjs(timestamp).format("HH:MM")}</span>
          <a href={status.axelarTransactionUrl} target='_blank'>
            <ArrowUpRight />
          </a>
        </div>
      </div>
      <div className={styles.stepsContainer}>
        {(route.estimate.isExpressSupported ? expressSteps : normalSteps).map((step, index) => (
          <div
            className={
              index <=
              txnStatusResponses[
                status.status === "source_gateway_called" ? `${status.status}_${status.gasStatus}` : status.status
              ]
                ? styles.completedStep
                : styles.incompleteStep
            }
            key={step}
          >
            <div className={styles.numberContainer}>
              <span className={styles.textContainer}>{index + 1}</span>
            </div>
            <div className={styles.stepName}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  ));
};

type CrossChainStatusPanelProps = {
  isTxnPanelOpen: boolean;
  setIsTxnPanelOpen: Dispatch<SetStateAction<boolean>>;
};

const CrossChainStatusPanel = ({ isTxnPanelOpen, setIsTxnPanelOpen }: CrossChainStatusPanelProps) =>
  isTxnPanelOpen ? (
    <Panel className={styles.container}>
      <div>
        <h4 className={styles.title}>Cross-Chain Transaction Status</h4>
        <Button className={styles.buttonClose} title='Click to close modal' onClick={() => setIsTxnPanelOpen(false)}>
          <ModalClose />
        </Button>
      </div>

      <TransactionStatus />
    </Panel>
  ) : null;

export default CrossChainStatusPanel;
