// Styles
import styles from "./Instructions.module.scss";

const ForwardInstructions = () => {
  return (
    <div className={styles.container}>
      <p>
        A Forward is a contract where the user agrees to buy or sell an asset at a fixed price and date in the future.
      </p>
      <p>Gain or loss depends on the difference between the agreed price and the market price at expiry.</p>
    </div>
  );
};

export default ForwardInstructions;
