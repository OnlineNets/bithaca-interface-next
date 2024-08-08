import { useState } from "react";

export const PAGE_LIMIT = 9;

const usePagination = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get start and end pages
  const pageStart = (currentPage - 1) * PAGE_LIMIT;
  const pageEnd = pageStart + PAGE_LIMIT;

  return { currentPage, handlePageChange, pageStart, pageEnd };
};

export default usePagination;
