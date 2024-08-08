// Packages
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Components
import Dropdown from "@/UI/components/Icons/Dropdown";

//Utils
import { useLastUrlSegment } from "@/UI/hooks/useLastUrlSegment";

// Hooks

// Layouts
import Flex from "@/UI/layouts/Flex/Flex";

// Styles
import styles from "@/UI/components/DropdownMenu/DropdownMenu.module.scss";
import { DropdownOptions } from "./DropdownOptions";
import { useDropdown } from "./useDropdown";
import Loader from "../Loader/Loader";

// Types
export type DropDownOption<T = { name: string; value: string }> = {
  name: string;
  value: string;
} & T;

type DropdownMenuProps<T = { name: string; value: string }> = {
  label?: string;
  id?: string;
  onChange?: (value: string, selectedOption: DropDownOption<T>) => void;
  disabled?: boolean;
  options: DropDownOption<T>[];
  value?: DropDownOption<T>;
  width?: number;
  size?: "sm" | "md" | "lg";
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  className?: string;
  type?: string;
  hasDropdown?: boolean;
  isLoading?: boolean;
};

const DropdownMenu = <T extends { name: string; value: string }>({
  onChange,
  options,
  disabled,
  label,
  width = 0,
  id,
  value,
  size = "md",
  iconStart,
  iconEnd,
  className,
  type,
  hasDropdown = true,
  isLoading = false,
}: DropdownMenuProps<T>) => {
  const lastSegment = useLastUrlSegment();

  const [selectedOption, setSelectedOption] = useState<DropDownOption<T> | null>(null);

  const { handleDropdownClick, isDropdownOpen, containerRef, optionsRef, optionsPosition, mounted } = useDropdown();

  useEffect(() => {
    setSelectedOption(value || null);
  }, [value]);

  const handleOptionClick = (item: DropDownOption<T>) => {
    setSelectedOption(item);
    if (onChange) onChange(item.value, item);
  };

  return (
    <div className={`${styles.container} ${className || ""} ${type ? styles[type] : ""}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div
        style={width > 0 ? { minWidth: width + "px" } : {}}
        className={`dropdownContainer--${lastSegment} ${styles.dropdownContainer} ${disabled ? styles.disabled : ""}`}
        onClick={() => !isLoading && handleDropdownClick()}
        role='button'
      >
        <div className={`${styles.input} ${isDropdownOpen ? styles.clickedDropdown : ""}`}>
          <Flex direction='dropdown' gap='gap-4'>
            {iconStart && iconStart}
            {isLoading ? (
              <Loader />
            ) : (
              <span className={size === "sm" ? styles.textSmall : styles.textMedium}>
                {selectedOption?.name ?? <span className={styles.placeholder}>-</span>}
              </span>
            )}
          </Flex>
          {hasDropdown && (
            <div className={styles.iconEnd}>
              {iconEnd && iconEnd}
              <div className={`${styles.icon} ${isDropdownOpen ? styles.isActive : ""}`}>
                <Dropdown />
              </div>
            </div>
          )}
        </div>
        {mounted &&
          document.querySelector<HTMLElement>("#portal") &&
          createPortal(
            <DropdownOptions
              optionsRef={optionsRef}
              isDropdownOpen={isDropdownOpen}
              optionsPosition={optionsPosition}
              options={options}
              handleOptionClick={handleOptionClick}
              selectedOption={selectedOption}
              size={size}
            />,
            document.querySelector<HTMLElement>("#portal") as HTMLElement
          )}
      </div>
    </div>
  );
};

export default DropdownMenu;
