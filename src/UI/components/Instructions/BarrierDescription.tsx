// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

// Styles
import styles from "./Instructions.module.scss";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

type BarrierDescriptionProps = {
  inOrOut: string; // Possible values: 'IN', 'OUT'
  buyOrSell: string; // Possible values: 'BUY', 'SELL'
  upOrDown: string; // Possible values: 'UP', 'DOWN'
  currentExpiryDate: string;
  strikeAmount?: string;
  barrierAmount?: string;
};

const BarrierDescription = ({
  inOrOut,
  buyOrSell,
  upOrDown,
  currentExpiryDate,
  strikeAmount = "",
  barrierAmount = "",
}: BarrierDescriptionProps) => {
  let description = <></>;
  const formattedDate = formatDate(currentExpiryDate, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
  description = (
    <>
      <div className='display-inline'>
        <span className='nowrap tablet-display-inline'>
          {buyOrSell} {upOrDown} and {inOrOut} and pay premium if you think
          <span className='ml-6 mr-6 mt-2 display-inline'>
            <LogoEth className='display-inline' />
          </span>
        </span>
        @ <i className='nowrap'>{formattedDate}</i> {upOrDown} from
        {strikeAmount} and not {inOrOut} side (
        {buyOrSell === "BUY" ? (
          upOrDown === "DOWN" ? (
            inOrOut === "IN" ? (
              <span className='display-inline'>&lt;</span>
            ) : (
              <span className='display-inline'>&gt;</span>
            )
          ) : inOrOut === "IN" ? (
            <span className='display-inline'>&gt;</span>
          ) : (
            <span className='display-inline'>&lt;</span>
          )
        ) : upOrDown === "DOWN" ? (
          inOrOut === "IN" ? (
            <span className='display-inline'>&gt;</span>
          ) : (
            <span className='display-inline'>&lt;</span>
          )
        ) : inOrOut === "IN" ? (
          <span className='display-inline'>&lt;</span>
        ) : (
          <span className='display-inline'>&gt;</span>
        )}
        ) {barrierAmount}
      </div>
      <span className='display-inline ml-6'>if not, premium lost.</span>
    </>
  );

  return <p className={styles.description}>{description}</p>;
};

export default BarrierDescription;
