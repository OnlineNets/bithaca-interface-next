// Packages
import { ReactNode } from "react";

//Utils
import { useLastUrlSegment } from "@/UI/hooks/useLastUrlSegment";

// Styles
import styles from "./RadioButton.module.scss";

type RadioButtonProps = {
  options: { option: string | ReactNode; value: string }[];
  selectedOption?: string;
  name: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  onChange?: (value: string) => void;
  width?: number | string;
  size?: "compact" | "regular" | "large" | "vertical-compact";
  radioButtonClassName?: string;
  optionClassName?: string;
  labelClassName?: string;
};

const RadioButton = ({
  options,
  selectedOption,
  name,
  disabled = false,
  orientation = "horizontal",
  onChange,
  width = 0,
  size = "regular",
  radioButtonClassName = "",
  optionClassName = "",
  labelClassName = "",
}: RadioButtonProps) => {
  const lastSegment = useLastUrlSegment();
  const renderOptions = (optionList: { option: string | ReactNode; value: string }[]) => {
    return optionList.map(option => {
      return (
        <div
          key={`${name}${option.value}`}
          className={`radioButton-option--${lastSegment} ${
            size === "compact" ? styles.optionCompact : size === "large" ? styles.optionLarge : styles.option
          } ${optionClassName}`}
        >
          <input
            type='radio'
            id={`${name}${option.value}`}
            name={name}
            value={option.value}
            disabled={disabled}
            checked={option.value === selectedOption}
            onChange={() => onChange?.(option.value)}
          />
          <label htmlFor={`${name}${option.value}`} className={`${styles.label} ${labelClassName}`}>
            {option.option}
          </label>
        </div>
      );
    });
  };

  return (
    <div
      className={`radioButton--${lastSegment} ${
        size === "compact" ? styles.radioButtonCompact : size === "large" ? styles.radioButtonLarge : styles.radioButton
      } ${orientation === "vertical" ? styles.vertical : ""} ${
        size === "vertical-compact" ? styles.verticalCompact : ""
      } ${radioButtonClassName}`}
      style={width > "0" ? { width: width + "px" } : {}}
    >
      {renderOptions(options)}
    </div>
  );
};

export default RadioButton;
