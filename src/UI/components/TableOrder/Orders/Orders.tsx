import { useEffect, useState } from "react";

import classNames from "classnames";
import { useBlockNumber, useWatchBlocks } from "wagmi";

import Modal from "@/UI/components/Modal/Modal";
import { useAppStore } from "@/UI/lib/zustand/store";
import Summary from "@/UI/components/Summary/Summary";
import { PortfolioCollateral } from "@ithaca-finance/sdk";
import { getActiveChain } from "@/UI/utils/RainbowKitHelpers";
import {
  currencyFilter,
  orderDateSort,
  orderFillSort,
  orderLimitSort,
  orderStatusSort,
  productFilter,
  sideFilter,
  tenorSort,
} from "@/UI/utils/TableOrder";

import HeaderColumns from "./Header";
import usePagination from "../usePagination";
import SingleOrderRow from "./SingleOrderRow";
import styles from "../TableOrder.module.scss";
import ExpandedOrderTable from "./ExpandedOrderTable";
import { transformClientOpenOrders } from "../helpers";
import { TableFooter } from "../components/TableFooter/TableFooter";
import ExpandableTable from "../components/ExpandableTable/ExpandableTable";
import { TABLE_TYPE, TableDescriptionProps, TableRowData, TableRowDataWithExpanded } from "../types";

const Orders = () => {
  const { ithacaSDK, isAuthenticated, quotingParams } = useAppStore();
  const { currentPage, handlePageChange, pageStart, pageEnd } = usePagination();

  const [data, setData] = useState<TableRowDataWithExpanded[]>([]);
  const [slicedData, setSlicedData] = useState<TableRowDataWithExpanded[]>([]);
  const [totalItemsAmount, setTotalItemsAmount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [rowToCancelOrder, setRowToCancelOrder] = useState<TableRowData | null>(null);
  const [collateralData, setCollateralData] = useState<TableDescriptionProps>({
    possibleReleaseX: 0,
    possibleReleaseY: 0,
    postOptimisationX: 0,
    postOptimisationY: 0,
  });
  const [sortHeader, setSortHeader] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(true);
  const [direction, setDirection] = useState<boolean>(true);
  const [currencyArray, setCurrencyArray] = useState<string[]>([]);
  const [productArray, setProductArray] = useState<string[]>([]);
  const [sideArray, setSideArray] = useState<string[]>([]);
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    fetchClientOrders();
  }, []);

  // Expanded row state
  const [expandedRow, setExpandedRow] = useState<number[]>([]);

  const fetchClientOrders = () => {
    ithacaSDK.orders.clientOpenOrders().then(res => {
      setData(transformClientOpenOrders(res));
      setLoading(false);
    });

    ithacaSDK.calculation.calcPortfolioCollateral().then((d: PortfolioCollateral) => {
      if (d) {
        setCollateralData({
          possibleReleaseX: d.actual.underlierAmount,
          possibleReleaseY: d.actual.numeraireAmount,
          postOptimisationX: d.potential.underlierAmount,
          postOptimisationY: d.potential.numeraireAmount,
        });
      }
    });
  };

  useWatchBlocks({
    chainId: getActiveChain().id,
    enabled: isAuthenticated,
    onBlock: fetchClientOrders,
  });

  // Handle cancel order
  const handleCancelOrderClick = (rowIndex: number) => {
    setRowToCancelOrder(slicedData[rowIndex]);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRowToCancelOrder(null);
  };

  // Function to handle the actual delete operation
  const handleCancelOrderRemoveRow = () => {
    setIsDeleting(true);
    ithacaSDK.orders.orderCancel(rowToCancelOrder?.clientOrderId || 0).then(() => {
      const newData = slicedData.filter(row => row !== rowToCancelOrder);
      setData(newData);
      setIsDeleting(false);
      setIsModalOpen(false);
      setRowToCancelOrder(null);
    });
  };

  // Function to handle the actual delete operation
  const handleCancelAllOrder = () => {
    setIsDeleting(true);
    ithacaSDK.orders.orderCancelAll().then(() => {
      setData([]);
      setIsDeleting(false);
      setIsModalOpen(false);
      setRowToCancelOrder(null);
    });
  };

  useEffect(() => {
    if (!isSorted && slicedData.length > 0) {
      updateSort("Order Date", false);
      setIsSorted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isSorted, slicedData]);

  // Handle row expand and collapse
  const handleRowExpand = (rowIndex: number) => {
    if (expandedRow.includes(rowIndex)) {
      setExpandedRow(prev => prev.filter(idx => idx !== rowIndex));
    } else {
      setExpandedRow(prev => [...prev, rowIndex]);
    }
  };

  const clearFilterArray = (label: string) => {
    switch (label) {
      case "side": {
        return setSideArray([]);
      }
      case "product": {
        return setProductArray([]);
      }
      case "currency": {
        return setCurrencyArray([]);
      }
    }
  };

  const applyFiltersAndSorting = () => {
    // Apply filters first
    let processedData = productFilter(data, productArray);
    processedData = sideFilter(processedData, sideArray);
    processedData = currencyFilter(processedData, currencyArray);

    // Apply sorting
    switch (sortHeader) {
      case "Order Date":
        processedData = orderDateSort(processedData, direction);
        break;
      case "Tenor":
        processedData = tenorSort(processedData, direction);
        break;
      case "Collateral Amount":
        processedData = tenorSort(processedData, direction);
        break;
      case "Order Limit":
        processedData = orderLimitSort(processedData, direction);
        break;
      case "Fill %":
        processedData = orderFillSort(processedData, direction);
        break;
      case "Status":
        processedData = orderStatusSort(processedData, direction);
        break;
      default:
        break;
    }

    setTotalItemsAmount(processedData.length);
    setSlicedData(processedData.slice(pageStart, pageEnd));
  };

  useEffect(() => {
    applyFiltersAndSorting();
  }, [data, productArray, sideArray, currencyArray, sortHeader, direction, pageStart, pageEnd]);

  const updateSort = (header: string, dir: boolean) => {
    setSortHeader(header);
    if (sortHeader != header) {
      setSortHeader(header);
      setDirection(dir);
    } else {
      setDirection(!direction);
    }
  };

  const displayIsLoading = !slicedData.length && isLoading && isAuthenticated;
  const displayNoResults = !slicedData.length && !isLoading;
  const displayTable = slicedData.length > 0;

  return (
    <>
      <div
        className={classNames(styles.gridContainerTableLiveOrders, {
          [styles.isOpacity]: !isAuthenticated,
        })}
      >
        <HeaderColumns
          updateSort={updateSort}
          currencyArray={currencyArray}
          clearFilterArray={clearFilterArray}
          productArray={productArray}
          sideArray={sideArray}
          setSideArray={setSideArray}
          setProductArray={setProductArray}
          setCurrencyArray={setCurrencyArray}
          type={TABLE_TYPE.LIVE}
          handleCancelAllOrder={handleCancelAllOrder}
        />

        {displayTable &&
          slicedData.map((row, rowIndex) => {
            const isRowExpanded = expandedRow.includes(rowIndex);
            return (
              <>
                <SingleOrderRow
                  handleRowExpand={handleRowExpand}
                  expandedRow={expandedRow}
                  row={row}
                  cancelOrder={true}
                  handleCancelOrderClick={handleCancelOrderClick}
                  rowIndex={rowIndex}
                  type={TABLE_TYPE.LIVE}
                />
                <ExpandableTable isRowExpanded={isRowExpanded} type={TABLE_TYPE.LIVE}>
                  <ExpandedOrderTable data={row.expandedInfo || []} type={TABLE_TYPE.LIVE} />
                </ExpandableTable>
              </>
            );
          })}
      </div>

      <TableFooter
        description={true}
        collateralData={collateralData}
        displayIsLoading={displayIsLoading}
        displayNoResults={displayNoResults}
        isAuthenticated={isAuthenticated}
        totalItems={totalItemsAmount}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />

      {/* Cancel order modal */}
      {isModalOpen && rowToCancelOrder && (
        <Modal
          title='Cancel Order'
          onCloseModal={handleCloseModal}
          onSubmitOrder={handleCancelOrderRemoveRow}
          isLoading={isDeleting}
          isOpen={isModalOpen}
        >
          <p>Please confirm if you&apos;d like to cancel your order.</p>
          <Summary detail={rowToCancelOrder} />
        </Modal>
      )}
    </>
  );
};

export default Orders;
