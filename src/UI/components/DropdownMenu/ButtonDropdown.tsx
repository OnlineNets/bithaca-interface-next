// Packages
import { createPortal } from "react-dom";

// Hooks

// Styles
import styles from "@/UI/components/DropdownMenu/DropdownMenu.module.scss";
import Button from "../Button/Button";
import { DropdownOptions } from "./DropdownOptions";
import { useDropdown } from "./useDropdown";

// Types
export type DropDownOption = {
  name: string;
  value: string;
};

type DropdownMenuProps = {
  label?: string;
  onChange?: (value: string, selectedOption: DropDownOption) => void;
  options: DropDownOption[];
  size?: "sm" | "md" | "lg";
  className?: string;
};

const ButtonDropdown = ({ onChange, options, label, size = "md", className }: DropdownMenuProps) => {
  const { handleDropdownClick, isDropdownOpen, setIsDropdownOpen, containerRef, optionsRef, optionsPosition, mounted } =
    useDropdown();

  const handleOptionClick = (item: DropDownOption) => {
    setIsDropdownOpen(false);
    if (onChange) onChange(item.value, item);
  };

  return (
    <div className={`${styles.container} ${className ?? ""}`} ref={containerRef}>
      <Button
        title={`Click to ${label}`}
        size='sm'
        variant='primary'
        onClick={handleDropdownClick}
        className='full-width'
      >
        {label}
      </Button>
      {mounted &&
        document.querySelector<HTMLElement>("#portal") &&
        createPortal(
          <DropdownOptions
            optionsRef={optionsRef}
            isDropdownOpen={isDropdownOpen}
            optionsPosition={optionsPosition}
            options={options}
            handleOptionClick={handleOptionClick}
            size={size}
          />,
          document.querySelector<HTMLElement>("#portal") as HTMLElement
        )}
    </div>
  );
};

export default ButtonDropdown;
