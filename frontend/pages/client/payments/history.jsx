import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../../layouts/ClientLayout';
import { getClientPaymentHistory } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const ITEMS_PER_PAGE = 10;

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

function ClientPaymentHistory() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getClientPaymentHistory(page, ITEMS_PER_PAGE);
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
    fetchHistory();
  }, [fetchHistory]);

  const handlePageChange = (page) => {
    fetchHistory(page);
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

  return (
    <div style={{ padding: '0' }}>
      <style jsx>{`
        .history-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-btn:hover {
          background: var(--bg-secondary);
        }
        .history-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .history-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .history-table-container {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
        }
        .history-table th {
          text-align: left;
          padding: 12px 16px;
          background: var(--bg-secondary);
          font-weight: 600;
          font-size: 14px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .history-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
        }
        .history-table tr:last-child td {
          border-bottom: none;
        }
        .history-table tr:hover {
          background: var(--bg-secondary);
        }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: white;
          border-top: 1px solid var(--border-color);
        }
        .pagination-info {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .pagination-buttons {
          display: flex;
          gap: 8px;
        }
        .page-btn {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
          background: var(--bg-secondary);
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        .empty-state {
          text-align: center;
          padding: 48px;
          color: var(--text-secondary);
        }
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 48px;
        }
      `}</style>

      <div className="history-header">
        <button className="back-btn" onClick={() => router.push('/client/payments')}>
          <BackIcon />
        </button>
        <div>
          <h1 className="history-title">Payment History</h1>
          <p className="history-subtitle">View all your payment transactions</p>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '12px 16px', 
          background: '#fee2e2', 
          color: '#b91c1c', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="history-table-container">
          <div className="empty-state">
            <h3 style={{ marginBottom: '8px' }}>No payment history</h3>
            <p>Your payment transactions will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Phase</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.project?.title || '-'}</td>
                  <td>{item.phaseName === 'FULL_PAYMENT' ? 'Full Payment' : item.phaseName}</td>
                  <td style={{ fontWeight: '600', color: '#065f46' }}>{formatCurrency(item.amount)}</td>
                  <td>{getModeBadge(item.paymentMode)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(item.paidDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((pagination.page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} of {pagination.total}
              </div>
              <div className="pagination-buttons">
                <button 
                  className="page-btn"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${pagination.page === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button 
                  className="page-btn"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default withClientLayout(ClientPaymentHistory);
