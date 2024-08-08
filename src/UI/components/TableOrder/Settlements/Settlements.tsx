import { useEffect, useState } from "react";
import classNames from "classnames";
import { useAppStore } from "@/UI/lib/zustand/store";

import styles from "../TableOrder.module.scss";

import ExpandableTable from "../components/ExpandableTable/ExpandableTable";
import { TableFooter } from "../components/TableFooter/TableFooter";
import { sortNumberValuesForSettlements, transformSettlementsOrders } from "../helpers";
import { SettlementRow, TABLE_TYPE } from "../types";
import ExpandedPositionTable from "./ExpandedPositionTable";
import HeaderColumns from "./Header";
import SinglePositionRow from "./SingleSettlementRow";
import { filterCurrencyPair, filterExpiry } from "./filters";
import usePagination from "../usePagination";

const Settlements = () => {
  const { ithacaSDK, isAuthenticated } = useAppStore();
  const { currentPage, handlePageChange, pageStart, pageEnd } = usePagination();
  // Data storage
  const [isLoading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<SettlementRow[]>([]);
  const [slicedData, setSlicedData] = useState<SettlementRow[]>([]);
  const [totalItemsAmount, setTotalItemsAmount] = useState<number>(0);
  // Expanded row state
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Sorting and filtering
  const [sortingHeader, setSortingHeader] = useState<string | null>(null);
  const [isSortingAsc, setIsSortingAsc] = useState<boolean>(true);
  const [currencyPairFilter, setCurrencyPairFilter] = useState<string[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<string[]>([]);

  const [expiryFilterAvailableOptions, setExpiryFilterAvailableOptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      ithacaSDK.client.historicalPositionsByDate(null, new Date().getTime()).then(positions => {
        const contractPromises = Object.keys(positions).map(key =>
          ithacaSDK.protocol.historicalContracts(`${Number(key)}`)
        );

        Promise.all(contractPromises).then(allContracts => {
          setData(transformSettlementsOrders(positions, allContracts.flat()));
          setLoading(false);
        });
      });
    }
  }, []);

  // Set available options for filters
  useEffect(() => {
    setExpiryFilterAvailableOptions(new Set(data.map(item => item.tenor)));
  }, [data]);
  // Handle row expand and collapse
  const handleRowExpand = (rowIndex: number) => {
    if (expandedRows.includes(rowIndex)) {
      setExpandedRows(prev => prev.filter(idx => idx !== rowIndex));
    } else {
      setExpandedRows(prev => [...prev, rowIndex]);
    }
  };

  // Function to apply filters and sorting
  const applyFiltersAndSorting = () => {
    let filteredData = filterExpiry(data, expiryFilter);
    filteredData = filterCurrencyPair(filteredData, currencyPairFilter);

    let sortedFilteredData;
    if (sortingHeader === "Settlement Price") {
      sortedFilteredData = sortNumberValuesForSettlements(filteredData, "settlementPrice", isSortingAsc);
    } else {
      sortedFilteredData = filteredData;
    }

    setTotalItemsAmount(sortedFilteredData.length);
    setSlicedData(sortedFilteredData.slice(pageStart, pageEnd));
  };

  // Effect to apply filters and sorting when data or criteria change
  useEffect(() => {
    applyFiltersAndSorting();
  }, [data, currencyPairFilter, expiryFilter, sortingHeader, isSortingAsc, pageStart, pageEnd]);

  const updateSort = (header: string) => {
    setSortingHeader(header);
    setIsSortingAsc(sortingHeader != header ? true : !isSortingAsc);
  };

  const displayIsLoading = !slicedData.length && isLoading && isAuthenticated;
  const displayNoResults = !slicedData.length && !isLoading;
  const displayTable = slicedData.length > 0;

  return (
    <>
      <div
        className={classNames(styles.gridContainerTableSettlements, {
          [styles.isOpacity]: !isAuthenticated,
        })}
      >
        <HeaderColumns
          currencyPairFilter={currencyPairFilter}
          setCurrencyPairFilter={setCurrencyPairFilter}
          expiryAvailableOptions={Array.from(expiryFilterAvailableOptions)}
          setExpiryFilter={setExpiryFilter}
          expiryFilter={expiryFilter}
          updateSort={updateSort}
        />

        {displayTable &&
          slicedData.map((row, rowIndex) => {
            const isRowExpanded = expandedRows.includes(rowIndex);
            return (
              <>
                <SinglePositionRow
                  handleRowExpand={handleRowExpand}
                  expandedRow={expandedRows}
                  row={row}
                  rowIndex={rowIndex}
                />
                <ExpandableTable isRowExpanded={isRowExpanded} type={TABLE_TYPE.SETTLEMENTS}>
                  <ExpandedPositionTable data={row.expandedInfo || []} />
                </ExpandableTable>
              </>
            );
          })}
      </div>

      <TableFooter
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

export default Settlements;
