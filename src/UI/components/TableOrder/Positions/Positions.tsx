import { useContext, useEffect, useState } from "react";

import classNames from "classnames";

import { useAppStore } from "@/UI/lib/zustand/store";
import { TutorialSteps } from "@/UI/constants/tutorialsteps";
import { OnboardingContext } from "@/UI/providers/onboarding-provider";

import Modal from "../../Modal/Modal";
import Button from "../../Button/Button";
import usePagination from "../usePagination";
import HeaderColumns from "./HeaderPositions";
import PayoffAtExpiry from "./PayoffAtExpiry";
import styles from "../TableOrder.module.scss";
import { PositionRow, TABLE_TYPE } from "../types";
import SinglePositionRow from "./SinglePositionRow";
import ClosePositionModal from "./ClosePositionModal";
import ExpandedPositionTable from "./ExpandedPositionTable";
import PayoffSection, { LegFormatted } from "../../PayoffSection";
import { TableFooter } from "../components/TableFooter/TableFooter";
import { sortNumberValues, transformPositionsOrders } from "../helpers";
import ExpandableTable from "../components/ExpandableTable/ExpandableTable";
import { filterExpiryInPositions, filterProductsInPositions, filterStrikeInPositions } from "./filters";

const Positions = () => {
  const { currentPage, handlePageChange, pageStart, pageEnd } = usePagination();
  const { ithacaSDK, isAuthenticated, unFilteredContractList } = useAppStore();
  const { updateStep, isTutorialDisabled } = useContext(OnboardingContext);
  // Data storage
  const [isLoading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PositionRow[]>([]);
  const [payoffDiagramRow, setPayoffDiagramRow] = useState<LegFormatted[] | null>(null);
  const [closePositionRow, setClosePositionRow] = useState<PositionRow | undefined>(undefined);
  const [slicedData, setSlicedData] = useState<PositionRow[]>([]);
  const [allAvailableFilteredData, setAllAvailableFilteredData] = useState<PositionRow[]>([]);
  const [totalItemsAmount, setTotalItemsAmount] = useState<number>(0);
  // Expanded row state
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Sorting and filtering
  const [sortingHeader, setSortingHeader] = useState<string | null>(null);
  const [isSortingAsc, setIsSortingAsc] = useState<boolean>(true);
  const [productFilter, setProductFilter] = useState<string[]>([]);
  const [strikeFilter, setStrikeFilter] = useState<string[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<string[]>([]);
  const [expiryFilterAvailableOptions, setExpiryFilterAvailableOptions] = useState<Set<string>>(new Set());
  const [strikeFilterAvailableOptions, setStrikeFilterAvailableOptions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      ithacaSDK.client.currentPositions("SHOW_ORDERS").then(res => {
        setData(transformPositionsOrders(res, unFilteredContractList));
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    setExpiryFilterAvailableOptions(new Set(data.map(item => item.tenor)));
    setStrikeFilterAvailableOptions(new Set(data.map(item => item.strike)));
  }, [data]);

  // Handle row expand and collapse
  const handleRowExpand = (rowIndex: number) => {
    if (expandedRows.includes(rowIndex)) {
      setExpandedRows(prev => prev.filter(idx => idx !== rowIndex));
    } else {
      setExpandedRows(prev => [...prev, rowIndex]);
    }
  };

  const applyFiltersAndSorting = () => {
    let filteredData = filterProductsInPositions(data, productFilter);
    filteredData = filterExpiryInPositions(filteredData, expiryFilter);
    filteredData = filterStrikeInPositions(filteredData, strikeFilter);

    let sortedFilteredData = filteredData;
    if (sortingHeader === "Quantity" || sortingHeader === "Average Price") {
      const key = sortingHeader === "Quantity" ? "quantity" : "averagePrice";
      sortedFilteredData = sortNumberValues(filteredData, key, isSortingAsc);
    }

    setTotalItemsAmount(sortedFilteredData.length);
    setAllAvailableFilteredData(sortedFilteredData);
    setSlicedData(sortedFilteredData.slice(pageStart, pageEnd));

    if (sortedFilteredData.length && !isTutorialDisabled) {
      updateStep?.(TutorialSteps.SHOW_PAYOFF_AT_EXPIRY);
    }
  };

  // Effect to apply filters and sorting when data or criteria change
  useEffect(() => {
    applyFiltersAndSorting();
  }, [
    isTutorialDisabled,
    data,
    productFilter,
    expiryFilter,
    strikeFilter,
    sortingHeader,
    isSortingAsc,
    pageStart,
    pageEnd,
  ]);

  const updateSort = (header: string, dir: boolean) => {
    setSortingHeader(header);
    setIsSortingAsc(sortingHeader != header ? true : !isSortingAsc);
  };

  const displayIsLoading = !slicedData.length && isLoading && isAuthenticated;
  const displayNoResults = !slicedData.length && !isLoading;
  const displayTable = slicedData.length > 0;

  const handleOpenPayoffDiagram = (row: PositionRow) => {
    const mapExpandedInfo = row?.expandedInfo?.map(item => {
      return {
        ...item,
        price: item.averageExecutionPrice,
        size: item.averageSize,
      };
    });
    setPayoffDiagramRow(mapExpandedInfo ?? null);
  };

  const closeModal = () => {
    setPayoffDiagramRow(null);
    setClosePositionRow(undefined);
  };

  const handleOpenPositionCloseModal = async (row: PositionRow) => {
    setClosePositionRow(row);
  };

  return (
    <>
      <PayoffAtExpiry expiryFilter={expiryFilter} allAvailableFilteredData={allAvailableFilteredData} />

      <ClosePositionModal closePositionRow={closePositionRow} closeModal={closeModal} />

      {/* Single Position Payoff diagram */}
      <Modal isOpen={Boolean(payoffDiagramRow)} title={`Position Summary`} onCloseModal={closeModal}>
        <div className='tw-flex tw-flex-col tw-gap-5'>
          {payoffDiagramRow && <PayoffSection data={payoffDiagramRow} tableType={TABLE_TYPE.ORDER} />}
          <Button title='close' className='mt-10' onClick={closeModal}>
            Close
          </Button>
        </div>
      </Modal>

      <div
        className={classNames(styles.gridContainerTable, {
          [styles.isOpacity]: !isAuthenticated,
        })}
      >
        <HeaderColumns
          isExpirySingleChoice={true}
          expiryAvailableOptions={Array.from(expiryFilterAvailableOptions)}
          strikeAvailableOptions={Array.from(strikeFilterAvailableOptions)}
          setProductFilter={setProductFilter}
          productFilter={productFilter}
          setExpiryFilter={setExpiryFilter}
          expiryFilter={expiryFilter}
          setStrikeFilter={setStrikeFilter}
          strikeFilter={strikeFilter}
          updateSort={updateSort}
        />

        {displayTable &&
          slicedData.map((row, rowIndex) => {
            const isRowExpanded = expandedRows.includes(rowIndex);
            return (
              <>
                <SinglePositionRow
                  handleOpenPositionCloseModal={handleOpenPositionCloseModal}
                  handleOpenPayoffDiagram={handleOpenPayoffDiagram}
                  handleRowExpand={handleRowExpand}
                  expandedRow={expandedRows}
                  row={row}
                  rowIndex={rowIndex}
                />
                <ExpandableTable isRowExpanded={isRowExpanded} type={TABLE_TYPE.ORDER}>
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

export default Positions;
