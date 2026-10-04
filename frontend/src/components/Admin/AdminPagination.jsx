import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from 'react-icons/fa';

const AdminPagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  const { t } = useTranslation();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="admin-pagination-bar">
      <div className="admin-pagination-info">
        {t('admin.pagination.showingEntries', 'Showing {{start}} - {{end}} of {{total}} entries', {
          start: startIndex,
          end: endIndex,
          total: totalItems,
        })}
      </div>
      <div className="admin-pagination-controls">
        <div className="admin-page-size-selector">
          <label>{t('admin.pagination.rowsPerPage', 'Rows per page:')}</label>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {totalPages > 1 && (
          <div className="admin-pagination-nav">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
              title={t('admin.pagination.first', 'First Page')}
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              title={t('admin.pagination.prev', 'Previous')}
            >
              <FaChevronLeft /> {t('admin.pagination.prev', 'Previous')}
            </button>
            <span className="pagination-indicator">
              {t('admin.pagination.pageOf', 'Page {{current}} of {{total}}', {
                current: currentPage,
                total: totalPages,
              })}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              title={t('admin.pagination.next', 'Next')}
            >
              {t('admin.pagination.next', 'Next')} <FaChevronRight />
            </button>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              title={t('admin.pagination.last', 'Last Page')}
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPagination;
