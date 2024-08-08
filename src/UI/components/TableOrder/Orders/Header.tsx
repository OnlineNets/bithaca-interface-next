import { useCallback, useEffect, useRef, useState } from "react";
// Utils
import { CURRENCY_PAIR_LABEL, FilterItemProps, PRODUCT_LABEL, SIDE_LABEL } from "@/UI/utils/TableOrder";
import { TABLET2_BREAKPOINT } from "@/UI/constants/breakpoints";

// Hooks
import { useEscKey } from "@/UI/hooks/useEscKey";
import useMediaQuery from "@/UI/hooks/useMediaQuery";

// Components
import Button from "@/UI/components/Button/Button";
import { CheckBoxControlled } from "@/UI/components/CheckBox/CheckBox";
import Sort from "@/UI/components/Icons/Sort";

// Styles
import styles from "../TableOrder.module.scss";
import { getTableHeaders } from "../helpers";
import { Separator } from "../components/Separator";
import { ClearFilters, ShowFilterButton } from "../components/helperComponents";
import { TABLE_TYPE } from "../types";
import * as Popover from "@radix-ui/react-popover";
import Flex from "@/UI/layouts/Flex/Flex";
import InformationIcon from "../../Icons/Information";

interface HeaderColumnsProps {
  updateSort: (header: string, dir: boolean) => void;
  currencyArray: string[];
  clearFilterArray: (type: string) => void;
  productArray: string[];
  sideArray: string[];
  setSideArray: (arr: string[]) => void;
  setProductArray: (arr: string[]) => void;
  setCurrencyArray: (arr: string[]) => void;
  type: TABLE_TYPE;
  handleCancelAllOrder?: () => void;
}

const HeaderColumns = (props: HeaderColumnsProps) => {
  const {
    updateSort,
    currencyArray,
    clearFilterArray,
    productArray,
    sideArray,
    setSideArray,
    setProductArray,
    setCurrencyArray,
    type,
    handleCancelAllOrder,
  } = props;
  const [filterHeader, setFilterHeader] = useState<string | null>(null);
  const tablet2Breakpoint = useMediaQuery(TABLET2_BREAKPOINT);

  // Define Ref variables for outside clickable
  const sideRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const productRef = useRef<HTMLDivElement | null>(null);

  const selectedLabeStatus = (label: string, isChecked: boolean) => {
    if (filterHeader == "Currency Pair") {
      if (isChecked) {
        setCurrencyArray([...currencyArray, label]);
      } else {
        setCurrencyArray(currencyArray.filter((item: string) => item !== label));
      }
    } else if (filterHeader == "Product") {
      if (isChecked) {
        setProductArray([...productArray, label.toUpperCase()]);
      } else {
        setProductArray(productArray.filter((item: string) => item !== label.toUpperCase()));
      }
    } else if (filterHeader == "Side") {
      if (isChecked) {
        setSideArray([...sideArray, label.toUpperCase()]);
      } else {
        setSideArray(sideArray.filter((item: string) => item !== label.toUpperCase()));
      }
    }
  };

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
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        sideRef.current &&
        !sideRef.current.contains(event.target as Node) &&
        productRef.current &&
        !productRef.current.contains(event.target as Node)
      ) {
        setFilterHeader(null);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const getHeaderIcon = (header: string) => {
    const filterClass = header === filterHeader ? "" : styles.hide;
    switch (header) {
      case "Order Date":
      case "Tenor":
      case "Collateral Amount":
      case "Order Limit":
      case "Price Traded":
      case "Status":
      case "Fill %":
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
      case "Currency Pair": {
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={currencyArray.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={containerRef}>
              {CURRENCY_PAIR_LABEL.map((item: FilterItemProps, idx: number) => {
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold'
                    checked={currencyArray.includes(item.label.toUpperCase())}
                    key={idx}
                    label={item.label}
                    component={item.component}
                    onChange={selectedLabeStatus}
                  />
                );
              })}
              <ClearFilters
                onClick={() => clearFilterArray("currency")}
                className={currencyArray.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      }
      case "Product": {
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={productArray.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={productRef}>
              {PRODUCT_LABEL.map(item => {
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold nowrap'
                    checked={productArray.includes(item.value.toUpperCase())}
                    key={item.value}
                    value={item.value}
                    label={item.label}
                    onChange={selectedLabeStatus}
                  />
                );
              })}
              <ClearFilters
                onClick={() => clearFilterArray("product")}
                className={productArray.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      }
      case "Side": {
        return (
          <>
            <ShowFilterButton onClick={showFilterBar(header)} fill={sideArray.length > 0} />
            <div className={`${styles.filterDropdown} ${filterClass}`} ref={sideRef}>
              {SIDE_LABEL.map((item: FilterItemProps) => {
                return (
                  <CheckBoxControlled
                    className='mb-5'
                    labelClassName='fs-xs-semibold'
                    value={item.label}
                    checked={sideArray.includes(item.label.toUpperCase())}
                    key={item.label}
                    label={item.label}
                    component={item.component}
                    onChange={selectedLabeStatus}
                  />
                );
              })}
              <ClearFilters
                onClick={() => clearFilterArray("side")}
                className={sideArray.length > 0 ? styles.selected : ""}
              />
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  const getHeaderTemplate = (header: string) => {
    switch (header) {
      case "Cancel All":
        return (
          <Button
            title='Click to cancel all orders'
            className={styles.cancelAllBtn}
            onClick={handleCancelAllOrder}
            variant='clear'
          >
            Cancel All
          </Button>
        );
      case "Type":
        return (
          <Flex>
            <Popover.Root>
              <Popover.Trigger>
                <div className='mr-4'>
                  <InformationIcon />
                </div>
              </Popover.Trigger>
              <Popover.Content align='end' alignOffset={5}>
                <div className={styles.typePopover}>
                  <div className={styles.typePopoverUnderline}>Good &lsquo;Til Canceled (GTC)</div> Order remains active
                  until either the order is filled or the user cancels it.
                </div>
              </Popover.Content>
            </Popover.Root>
            <div>Type</div>
          </Flex>
        );
      default:
        return (
          <>
            {header}
            {getHeaderIcon(header)}
          </>
        );
    }
  };

  return (
    <>
      {getTableHeaders(type).map(header => {
        return (
          <div className={styles.cell} key={header.name} style={{ ...header.style }}>
            {(header.name === "Cancel All" || header.name === "Details") && tablet2Breakpoint
              ? null
              : getHeaderTemplate(header.name)}
          </div>
        );
      })}
      {/* Bottom border of headers */}
      <Separator />
    </>
  );
};

export default HeaderColumns;
