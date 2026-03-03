import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../layouts/AdminLayout';
import { DataTable, Pagination, Alert } from '../../../components';
import { getPaymentHistory } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const ITEMS_PER_PAGE = 10;

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  const fetchHistory = useCallback(async (page = 1, search = '', paymentMode = '') => {
    try {
      setLoading(true);
      const response = await getPaymentHistory(page, ITEMS_PER_PAGE, search, paymentMode);
      setHistory(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1, searchQuery, modeFilter);
  }, [searchQuery, modeFilter, fetchHistory]);

  const handlePageChange = (page) => {
    fetchHistory(page, searchQuery, modeFilter);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getModeBadge = (mode) => {
    const colors = {
      'UPI': { bg: '#ede9fe', color: '#6d28d9' },
      'BANK': { bg: '#dbeafe', color: '#1e40af' },
      'CASH': { bg: '#d1fae5', color: '#065f46' },
      'CHEQUE': { bg: '#fef3c7', color: '#92400e' }
    };
    const style = colors[mode] || colors['CASH'];
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {mode}
      </span>
    );
  };

  const columns = [
    {
      key: 'client',
      title: 'Client',
      render: (_, row) => row.client?.name || '-'
    },
    {
      key: 'project',
      title: 'Project',
      render: (_, row) => row.project?.title || '-'
    },
    {
      key: 'phaseName',
      title: 'Phase',
      render: (val) => val === 'FULL_PAYMENT' ? 'Full Payment' : val
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (val) => formatCurrency(val)
    },
    {
      key: 'paymentMode',
      title: 'Mode',
      render: (val) => getModeBadge(val)
    },
    {
      key: 'paidDate',
      title: 'Payment Date',
      render: (val) => formatDate(val)
    }
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => router.push('/admin/payments')}
          >
            <BackIcon />
          </button>
          <div>
            <h1 className="page-title">Payment History</h1>
            <p className="page-description">View all payment transactions</p>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Search and Filter Bar */}
      <div style={{
        backgroundColor: 'white',
        padding: 'var(--spacing-4, 16px)',
        borderRadius: 'var(--border-radius-lg, 8px)',
        border: '1px solid var(--color-border, #e5e7eb)',
        marginBottom: 'var(--spacing-4, 16px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        gap: 'var(--spacing-3, 12px)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search by client or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 'var(--font-size-sm, 14px)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 'var(--border-radius-md, 6px)',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            fontSize: 'var(--font-size-sm, 14px)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 'var(--border-radius-md, 6px)',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '130px'
          }}
        >
          <option value="">All Modes</option>
          <option value="UPI">UPI</option>
          <option value="BANK">Bank</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
        </select>

        {(searchQuery || modeFilter) && (
          <button
            onClick={() => { setSearchQuery(''); setModeFilter(''); }}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--font-size-sm, 14px)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 'var(--border-radius-md, 6px)',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              color: 'var(--color-text-secondary)'
            }}
          >
            Clear
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={history}
        loading={loading}
        emptyMessage="No payment history"
        emptyDescription="Payment records will appear here once payments are made."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </AdminLayout>
  );
}
