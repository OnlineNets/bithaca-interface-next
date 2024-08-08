// Packages
import React, { ReactNode, useEffect, useRef, useState } from "react";

// Constants
import { ExpiryDateOptions, EXPIRY_DATE_OPTIONS } from "@/UI/constants/expiryDate";

// Hooks
import { useEscKey } from "@/UI/hooks/useEscKey";

// Styles
import styles from "./LabelValue.module.scss";
import DropdownOutlined from "../Icons/DropdownOutlined";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";

// Types
type LabelValueProps = {
  label: ReactNode;
  value?: ReactNode;
  valueList?: ExpiryDateOptions[];
  subValue?: ReactNode;
  hasDropdown?: boolean;
  defaultValue?: string;
  onChange?: (newValue: string) => void;
};

const LabelValue = ({
  label,
  value: initialValue,
  valueList = EXPIRY_DATE_OPTIONS,
  defaultValue = EXPIRY_DATE_OPTIONS[0].value,
  subValue,
  hasDropdown = false,
  onChange,
}: LabelValueProps) => {
  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [value, setValue] = useState(initialValue || defaultValue);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEscKey(() => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  });

  // Get label styles from dropdown prop
  const getDropdownStyle = (hasDropdown: boolean) => {
    return hasDropdown ? styles.labelDropdown : "";
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle option click
  const handleOptionClick = (optionValue: string) => {
    setValue(formatDate(optionValue, DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT));
    setIsDropdownOpen(false);
    onChange && onChange(optionValue);
  };

  // Render Dropdown Menu
  const renderDropdownOptions = () => {
    return (
      <ul className={styles.dropdownMenu}>
        {valueList.map(option => (
          <li
            key={option.value}
            className={`${styles.dropdownItem} ${value === option.value ? styles.selected : ""}`}
            onClick={() => handleOptionClick(option.value)}
            dangerouslySetInnerHTML={{ __html: option.label }}
          />
        ))}
      </ul>
    );
  };

  const handleClick = () => {
    if (hasDropdown) {
      toggleDropdown();
    }
  };
  return (
    <div onClick={handleClick} className={`${styles.labelValue} ${getDropdownStyle(hasDropdown)}`} ref={containerRef}>
      <div className={styles.contentWrapper}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {value}
          {subValue && <span className={styles.subValue}>{subValue}</span>}
        </span>
      </div>
      {hasDropdown && (
        <div className={`${styles.dropdown} ${isDropdownOpen ? styles.isActive : ""}`}>
          <DropdownOutlined />
          {isDropdownOpen && renderDropdownOptions()}
        </div>
      )}
    </div>
  );
};

export default LabelValue;
