import { useAppStore } from "@/UI/lib/zustand/store";
import { useEffect, useState } from "react";

import useToast from "@/UI/hooks/useToast";
import { getNumber, getNumberValue } from "@/UI/utils/Numbers";
import { AuctionSubmission } from "@/pages/trading/position-builder";
import { OrderSummaryType } from "@/types/orderSummary";
import { SIDE } from "@/utils/types";
import { ClientConditionalOrder, calculateNetPrice, createClientOrderId } from "@ithaca-finance/sdk";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import Modal from "../../Modal/Modal";
import OrderMoneySummary from "../../SubmitModal/OrderMoneySummary";
import TableStrategy from "../../TableStrategy/TableStrategy";
import Toast from "../../Toast/Toast";
import { PositionRow } from "../types";

interface ClosePositionModalProps {
  closePositionRow?: PositionRow;
  closeModal: () => void;
}

const SUGGESTED_OPTIONS = ["25", "50", "100"];

const ClosePositionModal = (props: ClosePositionModalProps) => {
  const [sellValue, setSellValue] = useState<string>("100");
  const { closePositionRow, closeModal } = props;
  const [orderSummary, setOrderSummary] = useState<OrderSummaryType | undefined>();
  const [auctionSubmission, setAuctionSubmission] = useState<AuctionSubmission | undefined>();

  const { showOrderErrorToast, showOrderConfirmationToast, toastList } = useToast();
  const { ithacaSDK, spotContract, getContractsByPayoff, currencyPrecision } = useAppStore();

  const prepareOrder = async () => {
    if (!closePositionRow || !sellValue) return;
    const contractsList = getContractsByPayoff(closePositionRow.product);
    const finalSize = `${Math.abs(closePositionRow.quantity) * (getNumber(sellValue) / 100)}` as `${number}`;
    const legs = [
      {
        contractId:
          closePositionRow.product === "NEXT_AUCTION"
            ? spotContract.contractId
            : contractsList[closePositionRow.strike].contractId,
        quantity: finalSize,
        side: closePositionRow.quantity < 0 ? SIDE.SELL : SIDE.BUY,
      },
    ];

    const totalNetPrice = calculateNetPrice(legs, [closePositionRow.averagePrice], currencyPrecision.strike);
    const order = {
      clientOrderId: createClientOrderId(),
      totalNetPrice: totalNetPrice,
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
      setAuctionSubmission({
        order: order,
        type: "Position Builder",
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
    prepareOrder();
  }, [closePositionRow, sellValue]);

  const getStrategiesFormatted = () => {
    if (!orderSummary || !closePositionRow) return [];
    return [
      {
        leg: orderSummary?.order.legs[0],
        referencePrice: closePositionRow?.averagePrice,
        payoff: closePositionRow?.product,
        strike: `${closePositionRow?.strike}`,
      },
    ];
  };

  const submitOrder = () => {
    if (!auctionSubmission) return;
    submitToAuction(auctionSubmission.order, auctionSubmission.type);
  };

  const submitToAuction = async (order: ClientConditionalOrder, orderDescr: string) => {
    try {
      await ithacaSDK.orders.newOrder(order, orderDescr);
      showOrderConfirmationToast();
    } catch (error) {
      showOrderErrorToast();
    } finally {
      setAuctionSubmission(undefined);
      closeModal();
    }
  };

  return (
    <>
      <Toast toastList={toastList} position={"bottom-right"} />
      <Modal title='Order Summary' isOpen={Boolean(closePositionRow)} onCloseModal={closeModal}>
        <div>
          <div className='tw-mb-8 tw-flex tw-items-center tw-justify-between'>
            <p className='tw-font-semibold'>Close Order</p>
            <div className='tw-flex tw-items-center tw-gap-1'>
              {SUGGESTED_OPTIONS.map(option => (
                <Button
                  key={option}
                  onClick={() => setSellValue(option)}
                  className='!tw-h-[24px] !tw-w-[60px]'
                  title={`Click to select ${option}%`}
                  variant={sellValue === option ? "primary" : "outline"}
                >
                  {option}%
                </Button>
              ))}

              <Input
                max={100}
                min={1}
                value={sellValue}
                onChange={e => setSellValue(getNumberValue(e.target.value))}
                icon={<div>%</div>}
              />
            </div>
          </div>
          {!!getStrategiesFormatted().length && (
            <>
              <p className='tw-mb-4 tw-font-semibold'>Strategy</p>
              <TableStrategy tableClassName='!tw-min-h-fit' strategies={getStrategiesFormatted()} hideClear={true} />
            </>
          )}
          <p className='tw-mb-4 tw-mt-8 tw-font-lato'>Please Confirm: Submit to Auction</p>
          <div className='tw-mb-4 tw-h-[1px] tw-bg-rgba-white-10' />
          <OrderMoneySummary auctionSubmission={auctionSubmission} orderSummary={orderSummary} />
          <Button onClick={submitOrder} title='Click to submit to auction' className='tw-mt-2 tw-w-full'>
            Submit to Auction
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ClosePositionModal;
