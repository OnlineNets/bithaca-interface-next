// Components
import Button from "@/UI/components/Button/Button";
import styles from "./OrderSummary.module.scss";
import { useAppStore } from "@/UI/lib/zustand/store";
import Warning from "@/UI/components/Icons/Warning";
import { useMemo, useState } from "react";

import ManageFundsModal from "../CollateralPanel/ManageFundsModal";
import { OrderSummaryType } from "@/types/orderSummary";
import { TableCollateralSummary } from "@/UI/constants/tableCollateral";
import { calculateTotalPremium, calculateTotalPremiumPlain } from "./helpers";
import { useHasEnoughFunds } from "./useHasEnoughFunds";

interface SubmitButtonProps {
  orderSummary: OrderSummaryType | undefined;
  connected: boolean | undefined;
  openConnectModal: () => void;
  submitAuction: () => void;
  onlyProtiftableOrders: boolean;
  isSubmitButtonDisabled: boolean;
}

export const SubmitButton = ({
  orderSummary,
  connected,
  openConnectModal,
  submitAuction,
  onlyProtiftableOrders,
  isSubmitButtonDisabled,
}: SubmitButtonProps) => {
  const { systemInfo, isLocationRestricted } = useAppStore();
  const [selectedCurrency, setSelectedCurrency] = useState<{ name: string; value: `0x${string}` } | undefined>();

  const premium = orderSummary?.order.totalNetPrice;
  const fee = orderSummary?.orderFees?.numeraireAmount;
  const isValidTotalPremium = premium ? calculateTotalPremium(premium, fee) !== "0.00" : false;
  const isValidConfiguration = useMemo(() => {
    return orderSummary?.orderLock && orderSummary?.orderFees;
  }, [orderSummary]);

  const { hasEnoughFunds } = useHasEnoughFunds({ orderSummary });

  const isValid = useMemo(() => {
    const feeValue = Math.abs(Number(fee));

    // Example
    // Platform fee 1.80
    // Total premium 0.80
    // Disallow for making order
    if (onlyProtiftableOrders) {
      if (!premium) return true;

      const totalPremium = calculateTotalPremiumPlain(premium, fee);
      return feeValue < totalPremium;
    }

    return true;
  }, [onlyProtiftableOrders, premium, fee]);

  const handleSubmitToAuction = () => {
    if (!hasEnoughFunds && isValidConfiguration) {
      // Opens modal
      setSelectedCurrency({ name: "USDC", value: systemInfo.tokenAddress["USDC"] });
    } else {
      submitAuction();
    }
  };

  if (!connected) {
    return (
      <Button
        size='lg'
        className='min-width-140'
        title='Click to Connect Wallet'
        onClick={() => {
          openConnectModal();
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  const renderWarning = () => {
    if (!orderSummary) return null;
    let warningMessage = null;
    if (!isValidConfiguration) {
      warningMessage = "Check Configuration";
    } else if (!hasEnoughFunds) {
      warningMessage = "Insufficient Balance";
    }

    return warningMessage ? (
      <div className={styles.balanceWarning}>
        <Warning /> <div className={styles.balanceText}>{warningMessage}</div>
      </div>
    ) : null;
  };

  const isDisabled = isSubmitButtonDisabled || isLocationRestricted || !isValidTotalPremium || !isValid;

  return (
    <>
      <ManageFundsModal
        displayModalTypeTabs={false}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        modalTab={selectedCurrency ? "deposit" : undefined}
      />
      {!hasEnoughFunds && isValidConfiguration ? (
        <Button size='lg' className='min-width-140' title='Click to submit to Deposit' onClick={handleSubmitToAuction}>
          Deposit
        </Button>
      ) : (
        <Button size='lg' title='Click to submit to auction' disabled={isDisabled} onClick={handleSubmitToAuction}>
          Submit to Auction
        </Button>
      )}
      {renderWarning()}
    </>
  );
};

export default SubmitButton;
