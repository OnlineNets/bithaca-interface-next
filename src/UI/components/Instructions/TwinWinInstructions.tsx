// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

// Styles
import styles from "./Instructions.module.scss";

const TwinWinInstructions = () => {
  return (
    <div className={styles.container}>
      <p>
        i. Select <LogoEth /> Price Reference.
      </p>
      <p>
        ii. Select desired <LogoEth /> Downside up to which exposure will have flipped from long to short.
      </p>
      <p>iii. Exposure flips back from short to long at Knock Out Barrier.</p>
    </div>
  );
};

export default TwinWinInstructions;
