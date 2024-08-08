// Packages
import { useEffect, useState } from "react";

// Styles
import styles from "./Toggle.module.scss";

// Types
type ToggleProps = {
  leftLabel?: string;
  rightLabel?: string;
  defaultState?: "left" | "right";
  onChange?: (state: "left" | "right") => void;
  size?: string;
  rightLabelClass?: string;
};

const Toggle = ({
  size,
  leftLabel = "",
  rightLabel = "",
  defaultState = "left",
  onChange,
  rightLabelClass,
}: ToggleProps) => {
  // Toggle state
  const [state, setState] = useState(defaultState);

  // Handle the toggle
  const handleToggle = () => {
    const newState = state === "left" ? "right" : "left";
    setState(newState);
    if (onChange) onChange(newState);
  };

  useEffect(() => {
    setState(defaultState);
  }, [defaultState]);

  // Get switch styles from toggle state
  const getSwitchStyle = () => (state === "right" ? `${styles.switch} ${styles.isActive}` : styles.switch);

  return (
    <div className={`${styles.toggle} ${styles[`toggle--${size}`]}`} onClick={handleToggle}>
      {leftLabel && <p>{leftLabel}</p>}
      <div className={getSwitchStyle()}>
        <div className={styles.slider}></div>
      </div>
      {rightLabel && <p className={rightLabelClass}>{rightLabel}</p>}
    </div>
  );
};

export default Toggle;
