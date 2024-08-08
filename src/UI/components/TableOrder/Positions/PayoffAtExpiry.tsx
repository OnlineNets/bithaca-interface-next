import { useContext, useState } from "react";

import { createPortal } from "react-dom";

import { SIDE } from "@/utils/types";
import { TutorialSteps } from "@/UI/constants/tutorialsteps";
import { formatNumberByFixedPlaces } from "@/UI/utils/Numbers";
import { POSITIONS_DECIMAL_PLACES } from "@/UI/utils/constants";
import { OnboardingContext } from "@/UI/providers/onboarding-provider";

import Modal from "../../Modal/Modal";
import Button from "../../Button/Button";
import { PositionRow, TABLE_TYPE } from "../types";
import PayoffSection, { LegFormatted } from "../../PayoffSection";
import TutorialPopover from "../../TutorialPopover/TutorialPopover";
import useToast from "@/UI/hooks/useToast";
import Toast from "../../Toast/Toast";

interface PayoffAtExpiryProps {
  expiryFilter: string[];
  allAvailableFilteredData: PositionRow[];
}

const PayoffAtExpiry = ({ expiryFilter, allAvailableFilteredData }: PayoffAtExpiryProps) => {
  const { currentStep, isTutorialDisabled } = useContext(OnboardingContext);
  const [payoffLegs, setPayoffLegs] = useState<LegFormatted[]>([]);
  const { showErrorToast, toastList } = useToast();
  const closeModal = () => {
    setPayoffLegs([]);
  };

  const showExpiryPayoff = () => {
    const data = allAvailableFilteredData
      .map(item => {
        const size = formatNumberByFixedPlaces(item.quantity, POSITIONS_DECIMAL_PLACES, true);
        if (size === "-" || !size) return null;
        return {
          type: item.product,
          side: item.quantity < 0 ? SIDE.SELL : SIDE.BUY,
          size: Number(size),
          strike: item.strike,
          averageExecutionPrice: item.averagePrice,
          expiry: item.tenor,
        };
      })
      .filter(Boolean) as LegFormatted[];
    if (data.length === 0) {
      showErrorToast({ title: "Wrong legs", message: "Legs quantity is 0" });
    } else {
      setPayoffLegs(data);
    }
  };

  return (
    <>
      <Toast toastList={toastList} position={"bottom-right"} />
      {document.querySelector<HTMLElement>("#tabsPortal") &&
        createPortal(
          <div>
            <TutorialPopover
              isOpen={currentStep === TutorialSteps.SHOW_PAYOFF_AT_EXPIRY && !isTutorialDisabled}
              align='start'
              side='top'
            >
              <div>
                <Button
                  disabled={expiryFilter.length === 0}
                  onClick={showExpiryPayoff}
                  size='sm'
                  title='Click to Show Payoff at Expiry'
                >
                  Show Payoff @ Expiry
                </Button>
              </div>
            </TutorialPopover>
          </div>,
          document.querySelector<HTMLElement>("#tabsPortal") as HTMLElement
        )}

      <Modal
        isOpen={Boolean(payoffLegs.length)}
        title={
          <h4>
            Position sumary{" "}
            {payoffLegs.length && (
              <span className='tw-ml-2 tw-text-xs tw-text-ithaca-white-60'>{payoffLegs?.[0].expiry}</span>
            )}
          </h4>
        }
        onCloseModal={closeModal}
      >
        <div className='tw-flex tw-flex-col tw-gap-5'>
          {payoffLegs.length && <PayoffSection tableType={TABLE_TYPE.HISTORY} data={payoffLegs} />}
          <Button title='close' className='mt-10' onClick={closeModal}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PayoffAtExpiry;
