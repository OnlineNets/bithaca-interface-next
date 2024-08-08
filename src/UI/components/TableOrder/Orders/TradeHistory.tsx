import { useEffect, useState } from "react";

import classNames from "classnames";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { useAppStore } from "@/UI/lib/zustand/store";
import {
  currencyFilter,
  orderDateSort,
  orderLimitSort,
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
import { TABLE_TYPE, TableRowDataWithExpanded } from "../types";
import { TableFooter } from "../components/TableFooter/TableFooter";
import DatePicker, { DateRangeInternal } from "../../DatePicker/DatePicker";
import ExpandableTable from "../components/ExpandableTable/ExpandableTable";
import { Data } from "react-csv/lib/core";
import { Detail, Order } from "@ithaca-finance/sdk";
import { DEFAULT_INPUT_DATE_FORMAT, DEFAULT_OUTPUT_DATE_FORMAT, formatDate } from "@/UI/utils/DateFormatting";
import dayjs from "dayjs";
import { CSVLink } from "react-csv";
import Download from "../../Icons/Download";
import { fetchOrderModelPrices } from "@/services/pricing/calcPrice.api.service";
import Modal from "../../Modal/Modal";
import PayoffSection from "../../PayoffSection";
import Button from "../../Button/Button";

const MAX_DAYS_SELECTED = 30; // backend limit
const MIN_DAYS_SELECTED = 2;
const TRADE_HISTORY_LIMIT = 999; // backend limit
const TRADE_OFFSET = 0;

const TradeHistory = () => {
  const { ithacaSDK, isAuthenticated, expiryList } = useAppStore();
  const { currentPage, handlePageChange, pageStart, pageEnd } = usePagination();

  const initialRange = {
    from: subDays(new Date(), 29), // backend accepts maximally 30days
    to: new Date(),
  };
  const [range, setRange] = useState<DateRangeInternal>(initialRange);
  const [payoffDiagramRow, setPayoffDiagramRow] = useState<TableRowDataWithExpanded | null>(null);
  const [data, setData] = useState<TableRowDataWithExpanded[]>([]);
  const [slicedData, setSlicedData] = useState<TableRowDataWithExpanded[]>([]);
  const [totalItemsAmount, setTotalItemsAmount] = useState<number>(0);

  const [sortHeader, setSortHeader] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(true);
  const [direction, setDirection] = useState<boolean>(true);

  const [currencyArray, setCurrencyArray] = useState<string[]>([]);
  const [productArray, setProductArray] = useState<string[]>([]);
  const [sideArray, setSideArray] = useState<string[]>([]);
  const [isSorted, setIsSorted] = useState(false);

  // Expanded row state
  const [expandedRow, setExpandedRow] = useState<number[]>([]);
  const [tradeHistoryReport, setTradeHistoryReport] = useState<Data>([]);

  const prepareTradeHistoryReport = (tradeHistory: Order[]) => {
    const transformedTradeHistory = tradeHistory.reduce(
      (tradeHistory: { [key: string]: string | number }[], order: Order) => {
        if (order.orderStatus !== "FILLED" && order.orderStatus !== "PARTIALLY_FILLED") {
          return tradeHistory;
        }

        const legs = order.details.reduce<{ [key: string]: string | number }>(
          (legsObject: { [key: string]: string | number }, detail: Detail, index: number) => {
            legsObject[`leg${index + 1}ContractId`] = detail.contractId;
            legsObject[`leg${index + 1}Payoff`] = detail.contractDto.payoff;
            legsObject[`leg${index + 1}Strike`] = detail.contractDto.economics.strike || "";
            legsObject[`leg${index + 1}Side`] = detail.side;
            legsObject[`leg${index + 1}FilledQty`] = detail.originalQty - detail.remainingQty;
            legsObject[`leg${index + 1}Expiry`] = formatDate(
              detail.expiry.toString(),
              DEFAULT_INPUT_DATE_FORMAT,
              DEFAULT_OUTPUT_DATE_FORMAT
            );
            legsObject[`leg${index + 1}ExecPrice`] = detail?.execPrice ?? "";

            return legsObject;
          },
          {}
        );

        const transformedOrder = {
          orderId: order.orderId,
          orderStatus: order.orderStatus,
          netPrice: order.netPrice,
          orderDate: dayjs(order.revDate).format("DDMMMYY HH:mm"),
          orderDescr: order.orderDescr,
          currencyPair: order.collateral.currencyPair,
          underlyingCollateral: order.collateral.underlierAmount,
          numeraireColalteral: order.collateral.numeraireAmount,
          ...legs,
        };

        tradeHistory.push(transformedOrder);
        return tradeHistory;
      },
      []
    );
    setTradeHistoryReport(transformedTradeHistory);
  };

  const fetchClientOrders = async () => {
    setLoading(true);

    const res = await ithacaSDK.client.tradeHistory(
      startOfDay(range.from).getTime(),
      endOfDay(range.to).getTime(),
      TRADE_OFFSET,
      TRADE_HISTORY_LIMIT
    );

    const filteredTradeHistory = res.filter(
      ({ orderStatus }) => orderStatus === "FILLED" || orderStatus === "PARTIALLY_FILLED"
    );

    const transformedData = transformClientOpenOrders(filteredTradeHistory);
    const modelPricesRes = await fetchOrderModelPrices(
      transformedData
        .map(row => ({
          orderId: row.clientOrderId,
          details: row.expandedInfo.map(expanded => ({
            currencyPair: row.currencyPair,
            payoff: expanded.type,
            expiry: expanded.expiryUnparsed,
            strike: expanded.strike || 0,
            position: expanded.size,
          })),
        }))
        .filter(row => !row.details.find(expanded => !expiryList.includes(expanded.expiry)))
    );

    setData(
      transformedData.map(row => {
        const price = modelPricesRes.data.find(p => p.orderId === row.clientOrderId);
        return {
          ...row,
          modelPrice: price?.price || row.modelPrice,
        };
      })
    );
    prepareTradeHistoryReport(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchClientOrders();
  }, [range]);

  useEffect(() => {
    if (!isSorted && slicedData.length > 0) {
      updateSort("Order Date", false);
      setIsSorted(true);
    }
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
      case "Price Traded":
        processedData = orderLimitSort(processedData, direction);
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

  const displayIsLoading = isLoading && isAuthenticated;
  const displayNoResults = !slicedData.length && !isLoading;
  const displayTable = slicedData.length > 0;

  const onSelect = (e: DateRange) => {
    setRange({
      from: e.from ?? initialRange.from,
      to: e.to ?? initialRange.to,
    });
  };

  const handleOpenPayoffDiagram = (row: TableRowDataWithExpanded) => {
    setPayoffDiagramRow(row);
  };

  const closePayoffModal = () => {
    setPayoffDiagramRow(null);
  };

  return (
    <>
      <Modal
        isOpen={Boolean(payoffDiagramRow)}
        title={
          <h4>
            Position sumary{" "}
            <span className='tw-ml-2 tw-text-xs tw-text-ithaca-white-60'>{payoffDiagramRow?.orderDate}</span>
          </h4>
        }
        onCloseModal={closePayoffModal}
      >
        <div className='tw-flex tw-flex-col tw-gap-5'>
          {payoffDiagramRow && <PayoffSection tableType={TABLE_TYPE.HISTORY} data={payoffDiagramRow.expandedInfo} />}
          <Button title='close' className='mt-10' onClick={closePayoffModal}>
            Close
          </Button>
        </div>
      </Modal>
      <div className='tw-mb-5 tw-flex tw-flex-row tw-items-center tw-gap-3'>
        <p className='tw-text-sm tw-text-white'>Date Range</p>
        <div>
          <DatePicker
            minSelected={MIN_DAYS_SELECTED}
            maxSelected={MAX_DAYS_SELECTED}
            start={range.from}
            end={range.to}
            handleSelect={onSelect}
          />
        </div>
        <CSVLink
          filename={`trade_history_${dayjs(range.from).format("DD-MM-YY")}_${dayjs(range.to).format("DD-MM-YY")}`}
          className='tw-text-sm tw-text-white'
          data={tradeHistoryReport}
        >
          <div className='flex tw-items-center tw-gap-1'>
            Download Page Data
            <Download width={20} height={20} />
          </div>
        </CSVLink>
      </div>
      <div
        className={classNames(styles.gridContainerTableHistory, {
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
          type={TABLE_TYPE.HISTORY}
        />
        {displayTable &&
          slicedData.map((row, rowIndex) => {
            const isRowExpanded = expandedRow.includes(rowIndex);
            return (
              <>
                <SingleOrderRow
                  handleOpenPayoffDiagram={handleOpenPayoffDiagram}
                  handleRowExpand={handleRowExpand}
                  expandedRow={expandedRow}
                  row={row}
                  rowIndex={rowIndex}
                  type={TABLE_TYPE.HISTORY}
                />
                <ExpandableTable isRowExpanded={isRowExpanded} type={TABLE_TYPE.ORDER}>
                  <ExpandedOrderTable data={row.expandedInfo || []} type={TABLE_TYPE.ORDER} />
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

export default TradeHistory;
