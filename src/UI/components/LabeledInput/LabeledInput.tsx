// Packages
import { ReactNode } from "react";
import classNames from "classnames";

// Styles
import styles from "./LabeledInput.module.scss";

// Types
type LabeledInputProps = {
  label: string;
  children: ReactNode;
  lowerLabel: ReactNode;
  labelClassName?: string;
  wrapperClassName?: string;
};

const LabeledInput = ({ label, children, lowerLabel, labelClassName, wrapperClassName }: LabeledInputProps) => {
  const labelClass = `${labelClassName || ""}`.trim();
  return (
    <div className={styles.container}>
      <div className={classNames(styles.wrapper, wrapperClassName)}>
        <p>{label}</p>
        {children}
      </div>
      <p className={labelClass}>{lowerLabel}</p>
    </div>
  );
};

export default LabeledInput;
