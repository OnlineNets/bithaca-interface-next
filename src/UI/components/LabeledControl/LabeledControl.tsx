// Packages
import { ReactNode } from "react";

// Styles
import styles from "./LabeledControl.module.scss";
import classNames from "classnames";

// Types
type LabeledControlProps = {
  label: string | ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  lowerLabel?: ReactNode;
  labelClassName?: string;
  lowerLabelClassName?: string;
  className?: string;
};

const LabeledControl = ({
  label,
  icon,
  children,
  labelClassName,
  lowerLabel,
  lowerLabelClassName,
  className,
}: LabeledControlProps) => {
  const labelClass = `${labelClassName || ""}`.trim();
  const lowerLabelClass = `${lowerLabelClassName || ""}`.trim();

  return (
    <div className={classNames(styles.container, className)}>
      <label className={labelClass}>
        {icon && icon} {label}
      </label>
      {children}
      <p className={lowerLabelClass}>{lowerLabel}</p>
    </div>
  );
};

export default LabeledControl;
