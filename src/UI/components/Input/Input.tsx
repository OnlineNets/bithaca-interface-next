// Packages
import { ChangeEvent, ReactElement, ReactNode, useEffect, useRef, useState } from "react";

// Utils
import { preventScrollOnNumberInput } from "@/UI/utils/Input";

// Components
import Error from "@/UI/components/Icons/Error";

// Types
type InputProps = {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  leftIcon?: ReactNode;
  icon?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  width?: number;
  type?: "text" | "number";
  id?: string;
  hasError?: boolean;
  footerText?: string;
  errorMessage?: string;
  onLink?: (linked: boolean) => void;
  increment?: (direction: "UP" | "DOWN") => void;
  isLinked?: boolean;
  canLink?: boolean;
  hasDropdown?: boolean;
  dropDownOptions?: DropDownOption[];
  onDropdownChange?: (option: string) => void;
  isLoading?: boolean;
  labelClassName?: string;
  className?: string;
  containerClassName?: string;
  min?: number;
  max?: number;
};

type DropDownOption = {
  value: string;
  label: string;
  icon: ReactElement;
};

// Styles
import styles from "./Input.module.scss";
import Link from "../Icons/Link";
import Button from "../Button/Button";
import UnLink from "../Icons/UnLink";
import ChevronUp from "../Icons/ChevronUp";
import ChevronDown from "../Icons/ChevronDown";
import Flex from "@/UI/layouts/Flex/Flex";
import DropdownOutlined from "../Icons/DropdownOutlined";
import { useEscKey } from "@/UI/hooks/useEscKey";
import Loader from "../Loader/Loader";
import classNames from "classnames";
import { getNumber } from "@/UI/utils/Numbers";

const Input = ({
  increment,
  onChange,
  value,
  icon,
  leftIcon,
  disabled,
  placeholder = "-",
  label,
  width = 0,
  type = "number",
  id,
  hasError = false,
  errorMessage,
  className,
  containerClassName,
  isLinked,
  canLink,
  onLink,
  footerText,
  hasDropdown,
  dropDownOptions,
  onDropdownChange,
  isLoading = false,
  labelClassName,
  min,
  max,
  ...props
}: InputProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Render Dropdown Menu
  const renderDropdownOptions = () => {
    return (
      <ul className={styles.dropdownMenu}>
        {dropDownOptions &&
          dropDownOptions.map(option => (
            <li
              key={option.value}
              className={classNames(styles.dropdownItem, "tw-flex", {
                [styles.active]: value === option.value,
              })}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.icon} {option.label}
            </li>
          ))}
      </ul>
    );
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle option click
  const handleOptionClick = (optionValue: string) => {
    setIsDropdownOpen(false);
    onDropdownChange && onDropdownChange(optionValue);
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (type === "number") {
      const numericValue = getNumber(value);

      if (min !== undefined && numericValue < min) return;
      if (max !== undefined && numericValue > max) return;

      onChange?.(e);
    } else {
      onChange?.(e);
    }
  };

  const handleIncrement = (direction: "UP" | "DOWN") => {
    if (type !== "number" || !increment) {
      return;
    }

    const numericValue = value ? getNumber(`${value}`) : undefined;

    if (direction === "UP") {
      if ((numericValue !== undefined && max !== undefined && numericValue < max) || max === undefined) {
        increment("UP");
      }
    } else if (direction === "DOWN") {
      if ((numericValue !== undefined && min !== undefined && numericValue > min) || min === undefined) {
        increment("DOWN");
      }
    }
  };

  return (
    <div
      className={classNames(styles.input, className, {
        [styles.error]: hasError,
      })}
      style={width > 0 ? { width: width + "px" } : {}}
    >
      {label && (
        <label htmlFor={id} className={classNames(styles.label, labelClassName)}>
          {label}
        </label>
      )}
      <div className={`${styles.container} ${containerClassName || ""}`} style={{ width: "100%" }}>
        {canLink && (
          <Button
            title='Click to link'
            variant='icon'
            size='sm'
            onClick={() => {
              onLink && onLink(!isLinked);
            }}
          >
            {isLinked ? <Link /> : <UnLink />}
          </Button>
        )}
        <Flex direction='column' classes='full-width'>
          <Flex direction='row-center'>
            {leftIcon && <div className='tw-mr-1'>{leftIcon}</div>}
            {isLoading ? (
              <div className='flexGrow'>
                <Loader />
              </div>
            ) : (
              <input
                {...props}
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                inputMode={type === "number" ? "decimal" : undefined}
                onChange={handleOnChange}
                onWheel={type === "number" ? preventScrollOnNumberInput : undefined}
                disabled={disabled}
                min={type === "number" ? min : undefined}
                max={type === "number" ? max : undefined}
              />
            )}
            {icon && <div className='tw-ml-1'>{icon}</div>}
            {hasDropdown && (
              <div onClick={toggleDropdown} className={`${styles.dropdown} ${isDropdownOpen ? styles.isActive : ""}`}>
                <div className='mmt-2'>
                  <DropdownOutlined />
                </div>
                {isDropdownOpen && renderDropdownOptions()}
              </div>
            )}
          </Flex>
          {footerText && <div className={styles.footer}>{footerText}</div>}
        </Flex>
        {increment && (
          <div className={styles.incrementWrapper}>
            <Flex direction='column'>
              <div className={styles.incrementButton}>
                <Button title='up' onClick={() => handleIncrement("UP")} variant='icon'>
                  <ChevronUp />
                </Button>
              </div>
              <div className={styles.incrementButton}>
                <Button title='up' onClick={() => handleIncrement("DOWN")} variant='icon'>
                  <ChevronDown />
                </Button>
              </div>
            </Flex>
          </div>
        )}
      </div>
      {hasError && errorMessage && (
        <div className={styles.errorMessage}>
          <Error />
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Input;
