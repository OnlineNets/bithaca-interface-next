import React, { ChangeEvent } from "react";
import styles from "./CalculatorInputRow.module.scss";
import Input from "../Input/Input";

type CalculatorInputRow = {
  label: string;
  description: string;
  value: string;
  type: "text" | "number";
  inputIcon?: JSX.Element;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const CalculatorInputRow = ({ label, inputIcon, description, type, value, onChange }: CalculatorInputRow) => {
  return (
    <div className={styles.formRow}>
      <div className={styles.labelContainer}>
        <label className={styles.label}>{label}</label>
        <p className={styles.description}>{description}</p>
      </div>
      <Input leftIcon={inputIcon} placeholder='' type={type} value={value} onChange={onChange} />
    </div>
  );
};

export default CalculatorInputRow;
