import styles from "@/UI/components/DropdownMenu/DropdownMenu.module.scss";
import { DropDownOption } from "./DropdownMenu";

interface DropdownOptionsProps<T> {
  optionsRef: React.MutableRefObject<HTMLDivElement | null>;
  isDropdownOpen: boolean;
  optionsPosition: { width: number; left: number; top: number };
  options: DropDownOption<T>[];
  handleOptionClick: (item: DropDownOption<T>) => void;
  selectedOption?: DropDownOption<T> | null;
  size: "sm" | "md" | "lg";
}

export const DropdownOptions = <T,>(props: DropdownOptionsProps<T>) => {
  const { optionsRef, isDropdownOpen, optionsPosition, options, handleOptionClick, selectedOption, size } = props;
  return (
    <div ref={optionsRef}>
      <ul
        className={`${styles.options} ${!isDropdownOpen ? styles.isHidden : ""}`}
        style={{
          width: `${optionsPosition.width}px`,
          left: `${optionsPosition.left}px`,
          top: `${optionsPosition.top}px`,
        }}
      >
        {options?.map((item: DropDownOption<T>, idx: number) => {
          return (
            <li
              key={item.value}
              onClick={() => handleOptionClick(item)}
              className={`${selectedOption?.value == item.value ? styles.selected : ""} ${
                size === "sm" ? styles.textSmall : styles.textMedium
              }`}
            >
              {item.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
