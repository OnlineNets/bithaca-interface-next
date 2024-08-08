// Components
import LogoEth from "@/UI/components/Icons/LogoEth";

// Styles
import styles from "./Instructions.module.scss";

const BonusInstructions = () => {
  return (
    <div className={styles.container}>
      <p>
        i. Select <LogoEth /> Price Reference.
      </p>
      <p>
        ii. Select desired <LogoEth /> Protection Extinction Level (KO Barrier)
      </p>
      <p>iii. Protection extinguished at Knock Out Barrier.</p>
    </div>
  );
};

export default BonusInstructions;
