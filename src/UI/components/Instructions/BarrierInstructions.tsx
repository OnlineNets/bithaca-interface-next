// Components
import LogoEth from "@/UI/components/Icons/LogoEth";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

// Styles
import styles from "./Instructions.module.scss";

type BarrierInscriptionProps = {
  inOrOut: string;
  upOrDown: string;
  currentExpiry: string;
};

const BarrierInstructions = ({ inOrOut, upOrDown, currentExpiry }: BarrierInscriptionProps) => {
  const formattedDate = formatDate(currentExpiry, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
  return (
    <div className={styles.container}>
      <p>
        i. Select Desired Direction{" "}
        <span className='flex-column-center mr-6'>
          <span className={upOrDown == "UP" ? "hide-psuedo color-white p-0" : "hide-psuedo color-white-30 p-0"}>
            Up
          </span>
          <span className={upOrDown == "DOWN" ? "hide-psuedo color-white p-0" : "hide-psuedo color-white-30 p-0"}>
            Down
          </span>
        </span>
      </p>
      <p>
        ii. Will <LogoEth /> move &lsquo;a lot&rsquo;?{" "}
        <span className='hide-psuedo p-0 ml-54'>( &lsquo;Knock IN&rsquo; )</span>
      </p>
      <p className='pl-14'>
        Will <LogoEth /> move &lsquo;not too much&rsquo;? ( &lsquo;Knock OUT&rsquo; )
      </p>
      <p>
        iii.
        <span className='flex-column-center mr-6'>
          <span className={upOrDown == "UP" ? "hide-psuedo color-white p-0" : "hide-psuedo color-white-30 p-0"}>
            Up
          </span>
          <span className={upOrDown == "DOWN" ? "hide-psuedo color-white p-0" : "hide-psuedo color-white-30 p-0"}>
            Down
          </span>
        </span>
        <span className='flex-column-center mr-6'>
          <span className={inOrOut == "IN" ? "hide-psuedo color-white p-0" : "hide-psuedo color-white-30 p-0"}>
            Knocks In ( effective )
          </span>
          <span className={inOrOut == "OUT" ? "hide-psuedo color-white p-0" : "hide-psuedo color-white-30 p-0"}>
            Knocks Out ( extinguished )
          </span>
        </span>
        <span className='flex-column-center hide-psuedo p-0'>
          <p>
            if <LogoEth /> at @<span className={`${styles.italic} hide-psuedo p-0`}>{formattedDate}</span> beyond
            barrier
          </p>
        </span>
      </p>
    </div>
  );
};

export default BarrierInstructions;
