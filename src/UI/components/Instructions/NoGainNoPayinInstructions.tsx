import { useMemo } from "react";

// Components
import LogoEth from "@/UI/components/Icons/LogoEth";
import LogoUsdc from "@/UI/components/Icons/LogoUsdc";
import Add from "@/UI/components/Icons/Add";
import Subtract from "@/UI/components/Icons/Subtract";
import ChevronLeftRight from "@/UI/components/Icons/ChevronLeftRight";

// Styles
import styles from "./Instructions.module.scss";
import Minus from "../Icons/Minus";
import UpsideDownside from "./UpsideDownside";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

type NoGainNoPayinInstructionsProps = {
  type?: "Call" | "Put";
  currentExpiryDate: string;
};

const NoGainNoPayinInstructions = ({ type = "Call", currentExpiryDate }: NoGainNoPayinInstructionsProps) => {
  const formattedDate = formatDate(currentExpiryDate, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT);
  const renderCurrentExpiryDate = useMemo(() => {
    return (
      <>
        Price @<span className={`${styles.italic}  hide-psuedo p-0`}>{formattedDate}</span>
      </>
    );
  }, [currentExpiryDate]);

  return (
    <div className={styles.container}>
      <p>
        i. Select <LogoEth /> Price Reference.
      </p>

      <div className={styles.gridContainer}>
        {/* First row */}
        <p>ii. Minimum expected</p>
        <p className='ml-6 mr-6'>
          <LogoEth />
        </p>
        <p>
          <UpsideDownside type={type} />
          move from
        </p>
        <p className='ml-6'>
          <LogoEth /> Price Reference presented.
        </p>

        {/* Second row */}
        <p className='justify-end'>(Maximum potential</p>
        <p className='ml-6 mr-6'>
          <LogoUsdc />
        </p>
        <p>
          loss if <LogoEth /> {renderCurrentExpiryDate}=
        </p>
        <p className='ml-6'>
          <LogoEth /> Price Reference.)
        </p>
      </div>

      <p>
        iii. Post minimum expected <LogoEth className='ml-10' />
        <UpsideDownside type={type} />
        as collateral.
      </p>
      <p className='pl-18'>
        - If <LogoEth /> {renderCurrentExpiryDate}
        <ChevronLeftRight
          colorGreater={type === "Call" ? "#54565b" : "white"}
          colorLess={type === "Call" ? "white" : "#54565b"}
        />
        <LogoEth className='ml-6' />
        Price Reference {type === "Call" ? <Add /> : <Minus color='#c5c5d9' />}
        <span className='flex-column-center'>
          <span className={type == "Call" ? "color-white hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>
            min Upside
          </span>
          <span className={type == "Put" ? "color-white hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>
            min Downside
          </span>
        </span>
        , receive <LogoEth /> {renderCurrentExpiryDate} <Subtract />
        <span className='flex-column-center'>
          <span className={type == "Call" ? "color-white hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>
            min Upside
          </span>
          <span className={type == "Put" ? "color-white hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>
            min Downside
          </span>
        </span>
        .
      </p>
      <p className='pl-18'>
        - If <LogoEth /> {renderCurrentExpiryDate}
        <ChevronLeftRight
          colorLess={type === "Call" ? "#54565b" : "white"}
          colorGreater={type === "Call" ? "white" : "#54565b"}
        />
        <LogoEth className='ml-6' />
        Price Reference, receive collateral back.
      </p>
    </div>
  );
};

export default NoGainNoPayinInstructions;
