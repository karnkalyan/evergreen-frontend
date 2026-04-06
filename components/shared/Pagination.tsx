import React from 'react';
import { ICONS } from '../../constants';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center space-x-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
        aria-label="Previous Page"
      >
        {ICONS.chevronLeft}
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${index}`} className="px-4 py-2 text-slate-500">
            {page}
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              currentPage === page
                ? 'bg-primary-gradient text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
        aria-label="Next Page"
      >
        {ICONS.chevronRight}
      </button>
    </nav>
  );
};

export default Pagination;