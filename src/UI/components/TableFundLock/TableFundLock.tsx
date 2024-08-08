// Packages
import { FundlockHistory } from "@ithaca-finance/sdk";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useBlockNumber, useWatchBlocks } from "wagmi";
import { formatUnits } from "viem";
import dayjs from "dayjs";

// Constants
import { TABLE_FUND_LOCK_HEADERS, TableFundLockDataProps } from "@/UI/constants/tableFundLock";

// Utils
import { auctionFilter, currencyFilter, foundLockAmountDataSort, foundLockOrderDateSort } from "@/UI/utils/TableFund";
import { AUCTION_LABEL, CURRENCY_PAIR_LABEL, FilterItemProps } from "@/UI/utils/TableOrder";
import { Currency } from "@/utils/types";
import { getActiveChain } from "@/UI/utils/RainbowKitHelpers";
import { formatNumberByCurrency } from "@/UI/utils/Numbers";

// Hooks
import { useEscKey } from "@/UI/hooks/useEscKey";
import { useAppStore } from "@/UI/lib/zustand/store";

// Components
import Button from "@/UI/components/Button/Button";
import CheckBox from "@/UI/components/CheckBox/CheckBox";
import Filter from "@/UI/components/Icons/Filter";
import Sort from "@/UI/components/Icons/Sort";
import Download from "../Icons/Download";
import { TableFooter } from "../TableOrder/components/TableFooter/TableFooter";
import SingleFundlockRow from "./SIngleRow";
import usePagination from "../TableOrder/usePagination";

// Styles
import styles from "./TableFundLock.module.scss";

type FundlockHistoryRow = {
  amount: string;
  blockTimestamp: string;
  token: string;
  withdrawalSlot?: string;
  transactionHash: `0x${string}`;
};

type DepositHistoryReport = {
  action: string;
  token: string;
  amount: string;
  time: string;
  transactionHash: string;
};

const TableFundLock = () => {
  const { ithacaSDK, isAuthenticated, systemInfo } = useAppStore();
  const [slicedData, setSlicedData] = useState<TableFundLockDataProps[]>([]);
  const [totalItemsAmount, setTotalItemsAmount] = useState<number>(0);
  const [sortHeader, setSortHeader] = useState<string>("");
  const [filterHeader, setFilterHeader] = useState<string>("");
  const [direction, setDirection] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [currencyArray, setCurrencyArray] = useState<string[]>([]);
  const [currencyChecked, setCurrencyChecked] = useState<boolean>(false);
  const [auctionArray, setAuctionArray] = useState<string[]>([]);
  const [auctionChecked, setAuctionChecked] = useState<boolean>(false);
  const [data, setData] = useState<TableFundLockDataProps[]>([]);
  const [depositHistoryReport, setDepositHistoryReport] = useState<DepositHistoryReport[]>([]);

  const { handlePageChange, currentPage, pageStart, pageEnd } = usePagination();

  const currencyRef = useRef<HTMLDivElement | null>(null);
  const auctionRef = useRef<HTMLDivElement | null>(null);

  const prepareDepositHistoryReport = (
    fundlockHistory: FundlockHistory,
    key: "deposits" | "withdrawalRequests" | "releases",
    action: string
  ): DepositHistoryReport[] => {
    const tokens = Object.keys(systemInfo.tokenAddress).reduce<{ [symbol: string]: string }>((tokens, token) => {
      tokens[systemInfo.tokenAddress[token]] = token;
      return tokens;
    }, {});

    return fundlockHistory[key].map(history => ({
      action,
      token: tokens[history.token],
      amount: formatUnits(BigInt(history.amount), systemInfo.tokenDecimals[history.token]),
      time: dayjs(parseInt(history.blockTimestamp) * 1000).format("DDMMMYY HH:mm"),
      transactionHash: history.transactionHash,
    }));
  };

  const fetchData = async () => {
    const data = await ithacaSDK.fundlock.fundlockHistory();
    transformData(data);
    const depositHistoryReport = [
      ...prepareDepositHistoryReport(data, "deposits", "Deposit"),
      ...prepareDepositHistoryReport(data, "withdrawalRequests", "Withdraw"),
      ...prepareDepositHistoryReport(data, "releases", "Release"),
    ];
    setDepositHistoryReport(depositHistoryReport);
    setLoading(false);
  };

  useWatchBlocks({
    chainId: getActiveChain().id,
    enabled: isAuthenticated,
    onBlock: fetchData,
  });

  const transformData = (data: FundlockHistory) => {
    const walletAddresses = Object.keys(systemInfo.tokenAddress).reduce(
      (obj, key) => {
        obj[systemInfo.tokenAddress[key].toLowerCase() as string] = key;
        return obj;
      },
      {} as Record<string, string>
    );
    const deposits = convertToRows(data?.deposits || [], "Deposit", walletAddresses);
    const releases = convertToRows(data?.releases || [], "Release", walletAddresses);
    const withdrawals = convertToRows(data?.withdrawalRequests || [], "Withdraw", walletAddresses);
    const allData = [...deposits, ...releases, ...withdrawals];
    const dataSorted = allData.toSorted((a, b) => Number(b.timestamp) - Number(a.timestamp));
    setData(dataSorted);
  };

  const convertToRows = (data: FundlockHistoryRow[], auction: string, walletAddresses: Record<string, string>) => {
    return data.map(d => {
      const currency = walletAddresses[d.token];
      return {
        withdrawalSlot: d.withdrawalSlot,
        transactionHash: d.transactionHash,
        timestamp: d.blockTimestamp,
        token: d.token as `0x${string}`,
        currency,
        orderDate: dayjs(Number(d.blockTimestamp) * 1000).format("DD MMM YY HH:mm"),
        asset: currency,
        auction: auction,
        amount: formatNumberByCurrency(
          Number(formatUnits(BigInt(d.amount), systemInfo.tokenDecimals[currency])),
          "string",
          currency as Currency
        ),
      };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node) &&
        auctionRef.current &&
        !auctionRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEscKey(() => {
    if (visible) {
      setVisible(false);
    }
  });

  // Set visible filter bar for show/hide filter box
  const showFilterBar = (header: string) => {
    if (header === filterHeader) {
      setVisible(!visible);
    } else {
      setVisible(true);
      setFilterHeader(header);
    }
  };

  const selectedLabeStatus = (label: string, status: boolean) => {
    if (filterHeader == "Currency") {
      setCurrencyChecked(false);
      const filter = currencyArray.slice();
      if (status) {
        filter.push(label);
        setCurrencyArray(filter);
      } else {
        const indexToRemove = filter.indexOf(label);
        if (indexToRemove !== -1) {
          filter.splice(indexToRemove, 1);
          setCurrencyArray(filter);
        }
      }
    } else if (filterHeader == "Auction") {
      setAuctionChecked(false);
      const filter = auctionArray.slice();
      if (status) {
        filter.push(label);
        setAuctionArray(filter);
      } else {
        const indexToRemove = filter.indexOf(label);
        if (indexToRemove !== -1) {
          filter.splice(indexToRemove, 1);
          setAuctionArray(filter);
        }
      }
    }
  };

  const clearFilterArray = (label: string) => {
    switch (label) {
      case "Currency": {
        setCurrencyChecked(true);
        return setCurrencyArray([]);
      }
      case "Auction": {
        setAuctionChecked(true);
        return setAuctionArray([]);
      }
      default:
        return null;
    }
  };

  const applyFiltersAndSorting = () => {
    let filteredData = currencyFilter(data, currencyArray);
    filteredData = auctionFilter(filteredData, auctionArray);

    let sortedFilteredData;
    switch (sortHeader) {
      case "Order Date":
        sortedFilteredData = foundLockOrderDateSort(filteredData, direction);
        break;
      case "Amount":
        sortedFilteredData = foundLockAmountDataSort(filteredData, direction);
        break;
      default:
        sortedFilteredData = filteredData;
    }

    setTotalItemsAmount(sortedFilteredData.length);
    setSlicedData(sortedFilteredData.slice(pageStart, pageEnd));
  };

  useEffect(() => {
    applyFiltersAndSorting();
  }, [data, currencyArray, auctionArray, sortHeader, direction, pageStart, pageEnd]);

  // Data sort function
  const updateSort = (header: string, dir: boolean) => {
    if (sortHeader != header) {
      setSortHeader(header);
      setDirection(dir);
    } else {
      setDirection(!direction);
    }
  };
  const getHeaderIcon = (header: string) => {
    switch (header) {
      case "Date":
      case "Amount":
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
      case "Currency": {
        return (
          <>
            <Button
              title='Click to view filter options'
              className={styles.filter}
              onClick={() => showFilterBar(header)}
            >
              <Filter fill={currencyArray.length > 0 ? true : false} />
            </Button>
            <div
              className={`${styles.filterDropdown} ${
                !visible ? styles.hide : header !== filterHeader ? styles.hide : ""
              }`}
              ref={currencyRef}
            >
              {CURRENCY_PAIR_LABEL.map((item: FilterItemProps, idx: number) => {
                return (
                  <CheckBox
                    key={idx}
                    label={item.label}
                    component={item.component}
                    onChange={selectedLabeStatus}
                    clearCheckMark={currencyChecked}
                  />
                );
              })}
              <Button
                title='Click to clear filter options'
                className={`${styles.clearAll} ${currencyArray.length > 0 ? styles.selected : ""}`}
                onClick={() => clearFilterArray("Currency")}
              >
                Clear All
              </Button>
            </div>
          </>
        );
      }
      case "Action": {
        return (
          <>
            <Button
              title='Click to view filter options'
              className={styles.filter}
              onClick={() => showFilterBar(header)}
            >
              <Filter fill={auctionArray.length > 0 ? true : false} />
            </Button>
            <div
              className={`${styles.filterDropdown} ${
                !visible ? styles.hide : header !== filterHeader ? styles.hide : ""
              }`}
              ref={auctionRef}
            >
              {AUCTION_LABEL.map((item: string, idx: number) => {
                return (
                  <CheckBox key={idx} label={item} onChange={selectedLabeStatus} clearCheckMark={auctionChecked} />
                );
              })}
              <Button
                title='Click to clear filter options'
                className={`${styles.clearAll} ${auctionArray.length > 0 ? styles.selected : ""}`}
                onClick={() => clearFilterArray("Auction")}
              >
                Clear All
              </Button>
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  const displayIsLoading = !slicedData.length && isLoading && isAuthenticated;
  const displayNoResults = !slicedData.length && !isLoading;
  const displayTable = slicedData.length > 0;
  const tableClass = `${styles.table} ${!isAuthenticated ? styles.isOpacity : ""}`;

  return (
    <>
      <div className='tw-mb-5 tw-flex tw-flex-row tw-items-center tw-gap-3'>
        <CSVLink filename='deposit-history' className='tw-text-sm tw-text-white' data={depositHistoryReport}>
          <div className='flex tw-items-center tw-gap-1'>
            Download Page Data
            <Download width={20} height={20} />
          </div>
        </CSVLink>
      </div>
      <div className={tableClass.trim()}>
        {TABLE_FUND_LOCK_HEADERS.map((header, idx) => (
          <div className={styles.cell} key={idx} style={header.style}>
            {header.name} {getHeaderIcon(header.name)}
          </div>
        ))}

        {displayTable &&
          slicedData.map((item, index) => (
            <SingleFundlockRow
              showTutorial={item.auction === "Withdraw" && !index}
              item={item}
              key={item.transactionHash}
            />
          ))}
      </div>

      <TableFooter
        description={false}
        displayIsLoading={displayIsLoading}
        displayNoResults={displayNoResults}
        isAuthenticated={isAuthenticated}
        totalItems={totalItemsAmount}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
    </>
  );
};

export default TableFundLock;
