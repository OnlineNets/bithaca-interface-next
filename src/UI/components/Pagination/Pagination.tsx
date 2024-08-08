// Components
import Next from "@/UI/components/Icons/Next";
import Previous from "@/UI/components/Icons/Previous";
import ReactPaginate from "react-paginate";
// Styles
import styles from "./Pagination.module.scss";

// Types
type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const PAGE_RANGE_DISPLAYED = 3;
const MARGIN_PAGES_DISPLAYED = 1;

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, className = "" }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const updatePage = ({ selected }: { selected: number }) => {
    onPageChange(selected + 1);
  };

  return (
    <div className={`${className} ${styles.pagination}`}>
      {totalPages > 1 && (
        <ReactPaginate
          breakLabel={
            <div key='endEllipsis' className={styles.ellipsis}>
              ...
            </div>
          }
          nextLabel={<Next />}
          previousLabel={<Previous />}
          onPageChange={updatePage}
          pageRangeDisplayed={PAGE_RANGE_DISPLAYED}
          marginPagesDisplayed={MARGIN_PAGES_DISPLAYED}
          pageCount={totalPages}
          forcePage={currentPage - 1}
          containerClassName={styles.pagination}
          pageClassName={styles.navigationItem}
          previousClassName={`${styles.navigationItem} ${styles.nextItem}`}
          nextClassName={`${styles.navigationItem} ${styles.nextItem}`}
          activeClassName={styles.active}
        />
      )}
    </div>
  );
};

export default Pagination;
