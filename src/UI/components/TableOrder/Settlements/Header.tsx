import { useEffect, useRef, useState } from "react";
import Sort from "@/UI/components/Icons/Sort";
import Button from "@/UI/components/Button/Button";
import { useEscKey } from "@/UI/hooks/useEscKey";
// Styles
import styles from "../TableOrder.module.scss";
import { TABLE_ORDER_SETTLEMENTS } from "../types";
import { Separator } from "../components/Separator";
import { ClearFilters, ShowFilterButton } from "../components/helperComponents";
import { CURRENCY_PAIR_LABEL, FilterItemProps } from "@/UI/utils/TableOrder";
import { CheckBoxControlled } from "@/UI/components/CheckBox/CheckBox";

interface HeaderPositionsProps {
  updateSort: (header: string, dir: boolean) => void;
  setExpiryFilter: (arr: string[]) => void;
  setCurrencyPairFilter: (arr: string[]) => void;
  expiryAvailableOptions: string[];
  expiryFilter: string[];
  currencyPairFilter: string[];
}

const Header = (props: HeaderPositionsProps) => {
  const {
    updateSort,
    expiryAvailableOptions,
    expiryFilter,
    setExpiryFilter,
    currencyPairFilter,
    setCurrencyPairFilter,
  } = props;

  const [filterHeader, setFilterHeader] = useState<string | null>(null);
  const currencyRef = useRef<HTMLDivElement | null>(null);
  const expiryRef = useRef<HTMLDivElement | null>(null);

  // Set visible filter bar for show/hide filter box
  const showFilterBar = (header: string) => () => {
    if (header === filterHeader) {
      setFilterHeader(null);
    } else {
      setFilterHeader(header);
    }
  };

  // Close Esc key for dropdown menu filter
  useEscKey(() => {
    if (filterHeader) {
      setFilterHeader(null);
    }
  });

  // Outside handle click for hide dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expiryRef.current &&
        !expiryRef.current.contains(event.target as Node) &&
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setFilterHeader(null);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const updateFilter = (label: string, isChecked: boolean) => {
    const labelUppercased = label.toUpperCase();

    if (filterHeader === "Expiry") {
      if (isChecked) {
        setExpiryFilter([...expiryFilter, labelUppercased]);
      } else {
        setExpiryFilter(expiryFilter.filter((item: string) => item !== labelUppercased));
      }
    }

    if (filterHeader === "Currency Pair") {
      if (isChecked) {
        setCurrencyPairFilter([...currencyPairFilter, labelUppercased]);
      } else {
        setCurrencyPairFilter(currencyPairFilter.filter((item: string) => item !== labelUppercased));
      }
    }
  };

  const getHeaderColumn = (header: string) => {
    const filterClass = header === filterHeader ? "" : styles.hide;
    switch (header) {
      case "Currency Pair": {
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={currencyPairFilter.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={currencyRef}>
              {CURRENCY_PAIR_LABEL.map((item: FilterItemProps, idx: number) => {
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold'
                    checked={currencyPairFilter.includes(item.label.toUpperCase())}
                    key={idx}
                    label={item.label}
                    component={item.component}
                    onChange={updateFilter}
                  />
                );
              })}
              <ClearFilters
                onClick={() => setCurrencyPairFilter([])}
                className={currencyPairFilter.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      }
      case "Expiry":
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={expiryFilter.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={expiryRef}>
              {expiryAvailableOptions.map(item => {
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold'
                    value={item}
                    checked={expiryFilter.includes(item.toUpperCase())}
                    key={item}
                    label={item}
                    onChange={updateFilter}
                  />
                );
              })}
              <ClearFilters
                onClick={() => setExpiryFilter([])}
                className={expiryFilter.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      case "Settlement Price":
        return (
          <Button
            title='Click to sort column'
            className={styles.sort}
            onClick={() => {
              updateSort(header, true);
            }}
          >
            <Sort />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {TABLE_ORDER_SETTLEMENTS.map(header => {
        return (
          <div className={styles.cell} key={header.name} style={{ ...header.style }}>
            {header.name}
            {getHeaderColumn(header.name)}
          </div>
        );
      })}
      {/* Bottom border of headers */}
      <Separator />
    </>
  );
};

export default Header;
