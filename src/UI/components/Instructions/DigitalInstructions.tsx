// Styles
import styles from "./Instructions.module.scss";

const DigitalInstructions = () => {
  return (
    <div className={styles.container}>
      <p>
        A Digital Call Option pays off if underlying asset price ends up above the strike at expiry, while a Digital Put
        Option pays off if underlying asset price ends up below the strike at expiry.
      </p>
      <p>Bet on whether the market will finish above or below the strike and get paid accordingly.</p>
    </div>
  );
};

export default DigitalInstructions;
