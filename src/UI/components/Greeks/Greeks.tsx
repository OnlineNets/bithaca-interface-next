// Constants
import { GREEK_SYMBOLS } from "@/UI/constants/greeks";
import { isInvalidNumber } from "@/UI/utils/Numbers";
import { useDevice } from "@/UI/hooks/useDevice";

// Styles
import styles from "./Greeks.module.scss";

type GreekSymbolProps = {
  greeks?: Record<string, number>;
};

const Greeks = ({ greeks }: GreekSymbolProps) => {
  const device = useDevice();

  const greeksElements = GREEK_SYMBOLS.map(({ symbol, name, id }) => (
    <div className={styles.column} key={name}>
      <label>
        <span dangerouslySetInnerHTML={{ __html: symbol }}></span>
        {name}
      </label>
      <div className={styles.value}>{greeks && !isInvalidNumber(greeks[id]) ? greeks[id].toFixed(3) : "0"}</div>
    </div>
  ));

  return (
    <div className={`${styles.container} ${device === "phone" && styles.mobile}`}>
      <div className={styles.title}>Greeks</div>
      {device === "phone" ? (
        <div className={`${styles.greeksContainer} ${device === "phone" && styles.mobile}`}>{greeksElements}</div>
      ) : (
        greeksElements
      )}
    </div>
  );
};

export default Greeks;
