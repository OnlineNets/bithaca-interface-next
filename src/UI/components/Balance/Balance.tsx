import { useContext, useMemo } from "react";
import { TABLE_COLLATERAL_SUMMARY } from "@/UI/constants/tableCollateral";
import styles from "./Balance.module.scss";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";
import Loader from "../Loader/Loader";
import { Currency } from "@/utils/types";
import TutorialPopover from "../TutorialPopover/TutorialPopover";
import { TutorialSteps } from "@/UI/constants/tutorialsteps";
import { OnboardingContext } from "@/UI/providers/onboarding-provider";

type NativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};

// Types
type BalanceProps = {
  selectedCurrency: Currency;
  estimatedFee?: { fee: string; nativeCurrency: NativeCurrency; isLoading: boolean };
  fundLock?: number;
  balance: string;
  margin?: string;
};

const Balance = ({ selectedCurrency, estimatedFee, fundLock, balance, margin = "m-0" }: BalanceProps) => {
  const currencyInformation = useMemo(() => {
    return (
      <>
        {TABLE_COLLATERAL_SUMMARY[selectedCurrency]?.currencyLogo || ""}
        <span>{selectedCurrency}</span>
      </>
    );
  }, [selectedCurrency]);
  const { currentStep } = useContext(OnboardingContext);
  return (
    <div className={`${styles.balance} ${margin && margin}`}>
      {!!fundLock && (
        <div className='flex-row gap-4'>
          Available Collateral on Ithaca: {formatNumberByCurrency(fundLock || 0, "", selectedCurrency)}
          {currencyInformation}
        </div>
      )}

      <TutorialPopover
        isOpen={
          currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_USDC ||
          currentStep === TutorialSteps.DEPOSIT_WITHOUT_BALANCE_WETH
        }
        align='end'
        side='bottom'
      >
        <div className='flex-row gap-4'>
          Balance: {formatNumberByCurrency(Number(balance), "", selectedCurrency)}
          {currencyInformation}
        </div>
      </TutorialPopover>

      {estimatedFee && (
        <div className='flex-row gap-4'>
          {(selectedCurrency as string) === "ETH" ? "Total Amount" : "Estimated Fee"}:{" "}
          {estimatedFee.isLoading ? (
            <div style={{ position: "relative", margin: "0 12px" }}>
              <Loader type='sm' />
            </div>
          ) : (
            <>
              {formatNumberByCurrency(Number(estimatedFee.fee), "", "WETH")}
              <span>{estimatedFee.nativeCurrency.symbol}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Balance;
