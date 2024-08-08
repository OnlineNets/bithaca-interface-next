import { useMemo } from "react";
// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

// Styles
import styles from "./Instructions.module.scss";
import InsideOutside from "./InsideOutside";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

type BetInstructionType = {
  type?: "INSIDE" | "OUTSIDE";
  currentExpiryDate: string;
};

const BetInstructions = ({ type = "INSIDE", currentExpiryDate }: BetInstructionType) => {
  const formattedDate = formatDate(currentExpiryDate, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
  const renderCurrentExpiryDate = useMemo(() => {
    return (
      <>
        @<span className={`${styles.italic}  hide-psuedo p-0`}>{formattedDate}</span>
      </>
    );
  }, [currentExpiryDate]);

  return (
    <div className={styles.container}>
      <div className={styles.gridContainer}>
        <p>Bet & Win Return if</p>
        <p className='ml-6 mr-2'>
          <LogoEth />
        </p>
        <p>{renderCurrentExpiryDate}</p>
        <p className='ml-6'>
          <InsideOutside type={type} /> Range.
        </p>

        <p>i. Bet Capital at Risk;</p>
        <p className='ml-6'>
          <LogoEth />
        </p>
        <p>{renderCurrentExpiryDate}</p>
        <p className='ml-6'>
          <InsideOutside type={type} /> Range?
        </p>
      </div>

      <p className='mb-10'>ii. Select Range. </p>
      <p className='mb-4'>iii. Offered Odds presented.</p>
      <p>
        iv. Offered Odds reflect the probability of
        <LogoEth />
        <InsideOutside type={type} />
        Range {renderCurrentExpiryDate}.
      </p>
    </div>
  );
};

export default BetInstructions;
