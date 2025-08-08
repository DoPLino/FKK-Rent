import React from 'react';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  size = 'medium',
  variant = 'default'
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    primary: 'bg-primary-50 dark:bg-primary-900 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800',
    outline: 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
  };

  const activeClasses = {
    default: 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700',
    primary: 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700',
    outline: 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'
  };

  const disabledClasses = 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed';

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      {/* Info */}
      {showInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`inline-flex items-center border rounded-md transition-colors ${
              sizeClasses[size]
            } ${
              currentPage === 1 
                ? disabledClasses 
                : variantClasses[variant]
            }`}
          >
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          </button>
        )}

        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center border rounded-md transition-colors ${
            sizeClasses[size]
          } ${
            currentPage === 1 
              ? disabledClasses 
              : variantClasses[variant]
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={`inline-flex items-center border rounded-md ${
                sizeClasses[size]
              } ${variantClasses[variant]}`}>
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageChange(page)}
                className={`inline-flex items-center border rounded-md transition-colors ${
                  sizeClasses[size]
                } ${
                  page === currentPage 
                    ? activeClasses[variant] 
                    : variantClasses[variant]
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center border rounded-md transition-colors ${
            sizeClasses[size]
          } ${
            currentPage === totalPages 
              ? disabledClasses 
              : variantClasses[variant]
          }`}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Last Page */}
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center border rounded-md transition-colors ${
              sizeClasses[size]
            } ${
              currentPage === totalPages 
                ? disabledClasses 
                : variantClasses[variant]
            }`}
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Compact Pagination
export const CompactPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  size = 'medium'
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-2 text-base'
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`inline-flex items-center border rounded-md transition-colors ${
          sizeClasses[size]
        } ${
          currentPage === 1 
            ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      <span className={`text-sm text-gray-700 dark:text-gray-300 ${sizeClasses[size]}`}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`inline-flex items-center border rounded-md transition-colors ${
          sizeClasses[size]
        } ${
          currentPage === totalPages 
            ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
