// Packages
import { AuctionSubmission, PositionBuilderStrategy } from "@/pages/trading/position-builder";
import Flex from "@/UI/layouts/Flex/Flex";
import { useAppStore } from "@/UI/lib/zustand/store";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import { toPrecision } from "@ithaca-finance/sdk";
import { useState } from "react";
import Button from "../Button/Button";
import LogoEth from "../Icons/LogoEth";
import LogoUsdc from "../Icons/LogoUsdc";
import SliderLeft from "../Icons/SliderLeft";
import SliderRight from "../Icons/SliderRight";
import Modal from "../Modal/Modal";
import TableStrategy from "../TableStrategy/TableStrategy";
import Toggle from "../Toggle/Toggle";

// Styles
import styles from "./SubmitModal.module.scss";
import { OrderSummaryType } from "@/types/orderSummary";
import { useUserBalance } from "@/UI/hooks/useUserBalance";
import CurrencyDisplay from "../CurrencyDisplay/CurrencyDisplay";
import OrderMoneySummary from "./OrderMoneySummary";

type SubmitModalProps = {
  isOpen: boolean;
  submitOrder: (auctionSubmission: AuctionSubmission) => void;
  auctionSubmission?: AuctionSubmission;
  closeModal: (close: boolean) => void;
  positionBuilderStrategies: PositionBuilderStrategy[];
  orderSummary?: OrderSummaryType;
};

const SubmitModal = ({
  isOpen,
  submitOrder,
  auctionSubmission,
  closeModal,
  positionBuilderStrategies,
  orderSummary,
}: SubmitModalProps) => {
  return (
    <Modal title='Submit to Auction' isOpen={isOpen} hideFooter={true} onCloseModal={() => closeModal(false)}>
      <>
        {!!positionBuilderStrategies.length && (
          <TableStrategy strategies={positionBuilderStrategies} hideClear={true} />
        )}
        {!!positionBuilderStrategies.length && (
          <Button
            className={`${styles.confirmButton}`}
            onClick={() => {
              if (!auctionSubmission) return;
              submitOrder(auctionSubmission);
            }}
            title='Click to confirm'
          >
            Confirm
          </Button>
        )}
        <OrderMoneySummary auctionSubmission={auctionSubmission} orderSummary={orderSummary} />
        {!positionBuilderStrategies.length && (
          <Button
            className={`${styles.confirmButton}`}
            onClick={() => {
              if (!auctionSubmission) return;
              submitOrder(auctionSubmission);
            }}
            title='Click to confirm'
          >
            Confirm
          </Button>
        )}
      </>
    </Modal>
  );
};

export default SubmitModal;
