// Packages
import React, { useState, useRef, useEffect } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import { createPortal } from "react-dom";
import { format } from "date-fns";

// Hooks
import { useEscKey } from "@/UI/hooks/useEscKey";

// Utils
import { formatDateDatePicker } from "@/UI/utils/DatePickerUtils";

// Components
import Calendar from "@/UI/components/Icons/Calendar";

// Styles
import "react-day-picker/dist/style.css";
import styles from "./DatePicker.module.scss";
import { useDevice } from "@/UI/hooks/useDevice";

// Types
export interface DateRangeInternal {
  from: Date;
  to: Date;
}
type DateProps = {
  handleSelect: (date: DateRange) => void;
  start?: Date;
  end?: Date;
  disabled?: boolean;
  minSelected?: number;
  maxSelected?: number;
};

const DatePicker = ({ minSelected, maxSelected, start, end, disabled = false, handleSelect }: DateProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [startDay, setStartDay] = useState<Date | undefined>(start);
  const [tempStartDay, setTempStartDay] = useState<Date | undefined>(start);
  const [endDay, setEndDay] = useState<Date | undefined>(end);
  const [tempEndDay, setTempEndDay] = useState<Date | undefined>(end);
  const [dateText, setDateText] = useState<JSX.Element | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [optionsPostion, setOptionsPosition] = useState({ width: 0, top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const device = useDevice();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    setMounted(true);
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [start, end]);

  useEscKey(() => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  });

  useEffect(() => {
    setDateText(
      <>
        <span dangerouslySetInnerHTML={{ __html: formatDateDatePicker(startDay) }} />
        {" - "}
        <span dangerouslySetInnerHTML={{ __html: formatDateDatePicker(endDay) }} />
      </>
    );
  }, [start, end]);

  const handleDropdownClick = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    setOptionsPosition({
      width: 510,
      left: containerRect?.x ?? 0,
      top: (containerRect?.y ?? 0) + (containerRect?.height ?? 0) + document.documentElement.scrollTop + 1,
    });
    if (!disabled) setIsDropdownOpen(!isDropdownOpen);
  };

  const handleApplyClick = () => {
    if (startDay && endDay) {
      setTempEndDay(endDay);
      setTempStartDay(startDay);
      setDateText(
        <>
          <span dangerouslySetInnerHTML={{ __html: formatDateDatePicker(startDay) }} />
          {" - "}
          <span dangerouslySetInnerHTML={{ __html: formatDateDatePicker(endDay) }} />
        </>
      );
      handleSelect?.({ from: startDay, to: endDay });
    } else if (startDay && !endDay) {
      setEndDay(startDay);
      setTempEndDay(startDay);
      setDateText(
        <>
          <span dangerouslySetInnerHTML={{ __html: formatDateDatePicker(startDay) }} />
          {" - "}
          <span dangerouslySetInnerHTML={{ __html: formatDateDatePicker(startDay) }} />
        </>
      );
      handleSelect?.({ from: startDay, to: startDay });
    } else {
      setTempEndDay(endDay);
      setTempStartDay(startDay);
      handleSelect?.({ from: startDay, to: endDay });
    }

    setIsDropdownOpen(false);
  };

  const handleCancelClick = () => {
    setStartDay(tempStartDay);
    setEndDay(tempEndDay);
    setIsDropdownOpen(false);
  };

  const selectStartDay = (e: DateRange | undefined) => {
    setStartDay(e?.from);
    setEndDay(e?.to);
  };

  return (
    <>
      <div
        className={styles.dateRangePickerContainer}
        onClick={() => handleDropdownClick()}
        ref={containerRef}
        role='button'
      >
        <div className={styles.dateInput}>{dateText}</div>
        <Calendar />
      </div>

      {mounted &&
        document.querySelector<HTMLElement>("#datePicker") &&
        createPortal(
          <div ref={optionsRef}>
            <div
              className={`${styles.dateBlock} ${!isDropdownOpen ? styles.isHidden : ""}`}
              style={{
                left: `${optionsPostion.left}px`,
                top: `${optionsPostion.top}px`,
              }}
            >
              <div className={styles.dateRangeContainer}>
                <div className={styles.subContainer}>
                  <DayPicker
                    formatters={{
                      formatWeekdayName: date => format(date, "EEE"),
                    }}
                    min={minSelected}
                    max={maxSelected}
                    className={`${styles.datePicker}`}
                    mode='range'
                    defaultMonth={startDay}
                    numberOfMonths={device == "desktop" ? 2 : 1}
                    selected={{ from: startDay, to: endDay }}
                    onSelect={e => selectStartDay(e)}
                    modifiersClassNames={{
                      today: "myToday",
                    }}
                    modifiersStyles={{
                      disabled: { fontSize: "90%" },
                    }}
                  />
                </div>
              </div>
              <div className={styles.buttonContainer}>
                <div className={styles.cancelButton} onClick={() => handleCancelClick()} role='button'>
                  Cancel
                </div>
                <div className={styles.applyButton} onClick={() => handleApplyClick()} role='button'>
                  Apply
                </div>
              </div>
            </div>
          </div>,
          document.querySelector<HTMLElement>("#datePicker") as HTMLElement
        )}
    </>
  );
};

export default DatePicker;
