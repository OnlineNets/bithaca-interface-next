// Components
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import ArrowRight from "@/UI/components/Icons/ArrowRight";
import ChevronLeft from "@/UI/components/Icons/ChevronLeft";
import ChevronRight from "@/UI/components/Icons/ChevronRight";
import Add from "@/UI/components/Icons/Add";

// Styles
import styles from "./Instructions.module.scss";
import CurlyBracketLeft from "../Icons/CurlyBracketLeft";
import CurlyBracketRight from "../Icons/CurlyBracketRight";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
type props = {
  currentExpiryDate: string;
};
const RiskyEarnInstructions = ({ currentExpiryDate }: props) => {
  const formattedDate = formatDate(currentExpiryDate, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
  return (
    <div className={styles.container}>
      <p>
        i. Risk
        <span className={styles.spacer} />
        <span className={styles.stackedLogo}>
          <LogoEth />
          <LogoUsdc />
        </span>
        <span className={styles.spacer} />
        <em>Now</em>
        <ArrowRight />
        <CurlyBracketLeft />
        Risk
        <span className={styles.stackedLogo}>
          <LogoEth />
          <LogoUsdc />
        </span>
        + Return
        <LogoUsdc />
        <CurlyBracketRight />@ <span className={`${styles.italic} hide-psuedo p-0`}>{formattedDate}.</span>
      </p>
      <p className='mb-5'>
        ii. Select <LogoEth /> Target Price.
      </p>
      <div className='d-flex flex-row' style={{ alignItems: "start" }}>
        <p className='mr-4'>iii.</p>
        <div className='pt-5'>
          <p>
            - If at {formattedDate} <LogoEth /> <ChevronLeft /> Target Price, receive Risk equivalent worth of{" "}
            <LogoEth /> <Add />
            Return in <LogoUsdc /> .
          </p>
          <p>
            - If at {formattedDate} <LogoEth /> <ChevronRight /> Target Price, receive Risk equivalent worth of{" "}
            <LogoUsdc /> <Add />
            Return in <LogoUsdc /> .
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskyEarnInstructions;
