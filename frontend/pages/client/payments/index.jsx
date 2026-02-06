import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../../layouts/ClientLayout';
import { getClientPaymentSummary } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function ClientPayments() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await getClientPaymentSummary();
        setPlans(response.data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load payment summary');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
      'PARTIAL': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
      'PAID': { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' }
    };
    return styles[status] || styles['PENDING'];
  };

  const totalAmount = plans.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalPaid = plans.reduce((sum, p) => sum + (p.totalPaidAmount || 0), 0);
  const totalPending = totalAmount - totalPaid;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <div className="loading-spinner loading-spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <style jsx>{`
        .payments-header {
          margin-bottom: 24px;
        }
        .payments-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .payments-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border-color);
        }
        .summary-card-label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .summary-card-value {
          font-size: 24px;
          font-weight: 600;
        }
        .payment-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          margin-bottom: 16px;
          overflow: hidden;
        }
        .payment-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .payment-card-title {
          font-weight: 600;
          font-size: 16px;
        }
        .payment-card-body {
          padding: 20px;
        }
        .payment-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .payment-stat {
          text-align: center;
        }
        .payment-stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .payment-stat-value {
          font-size: 16px;
          font-weight: 600;
        }
        .progress-bar {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .phase-list {
          border-top: 1px solid var(--border-color);
          margin-top: 16px;
          padding-top: 16px;
        }
        .phase-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .phase-item:last-child {
          border-bottom: none;
        }
        .phase-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .phase-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .phase-icon.paid {
          background: #d1fae5;
          color: #065f46;
        }
        .phase-icon.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .phase-name {
          font-weight: 500;
        }
        .phase-date {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .history-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-primary);
          font-weight: 500;
          cursor: pointer;
          margin-top: 24px;
        }
        .history-link:hover {
          text-decoration: underline;
        }
        .empty-state {
          text-align: center;
          padding: 48px;
          color: var(--text-secondary);
        }
      `}</style>

      <div className="payments-header">
        <h1 className="payments-title">Payments</h1>
        <p className="payments-subtitle">View your payment summary and history</p>
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

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-label">Total Amount</div>
          <div className="summary-card-value">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Paid</div>
          <div className="summary-card-value" style={{ color: '#065f46' }}>{formatCurrency(totalPaid)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Pending</div>
          <div className="summary-card-value" style={{ color: '#92400e' }}>{formatCurrency(totalPending)}</div>
        </div>
      </div>

      {/* Payment Plans */}
      {plans.length === 0 ? (
        <div className="empty-state">
          <CreditCardIcon />
          <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>No payment plans</h3>
          <p>Payment information will appear here once set up.</p>
        </div>
      ) : (
        plans.map(plan => {
          const progressPercent = plan.totalAmount > 0
            ? Math.round((plan.totalPaidAmount / plan.totalAmount) * 100)
            : 0;
          const statusStyle = getStatusStyle(plan.status);

          return (
            <div key={plan._id} className="payment-card">
              <div className="payment-card-header">
                <span className="payment-card-title">{plan.project?.title}</span>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`
                  }}
                >
                  {plan.status}
                </span>
              </div>
              <div className="payment-card-body">
                <div className="payment-stats">
                  <div className="payment-stat">
                    <div className="payment-stat-label">Total</div>
                    <div className="payment-stat-value">{formatCurrency(plan.totalAmount)}</div>
                  </div>
                  <div className="payment-stat">
                    <div className="payment-stat-label">Paid</div>
                    <div className="payment-stat-value" style={{ color: '#065f46' }}>
                      {formatCurrency(plan.totalPaidAmount)}
                    </div>
                  </div>
                  <div className="payment-stat">
                    <div className="payment-stat-label">Pending</div>
                    <div className="payment-stat-value" style={{ color: '#92400e' }}>
                      {formatCurrency(plan.remainingAmount ?? (plan.totalAmount - plan.totalPaidAmount))}
                    </div>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent === 100 ? '#10b981' : '#3b82f6'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {plan.paymentType.replace('_', ' ')} • {progressPercent}% Complete
                </div>

                {/* Phases */}
                {plan.paymentType === 'PHASE_WISE' && plan.phases && plan.phases.length > 0 && (
                  <div className="phase-list">
                    <div style={{ fontWeight: '600', marginBottom: '12px' }}>Payment Phases</div>
                    {plan.phases.map(phase => (
                      <div key={phase._id} className="phase-item">
                        <div className="phase-info">
                          <div className={`phase-icon ${phase.status === 'PAID' ? 'paid' : 'pending'}`}>
                            {phase.status === 'PAID' ? <CheckCircleIcon /> : <ClockIcon />}
                          </div>
                          <div>
                            <div className="phase-name">{phase.phaseName}</div>
                            <div className="phase-date">
                              {phase.status === 'PAID'
                                ? `Paid on ${formatDate(phase.paidDate)} via ${phase.paymentMode}`
                                : phase.dueDate ? `Due: ${formatDate(phase.dueDate)}` : 'No due date'
                              }
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: '600' }}>{formatCurrency(phase.calculatedAmount)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {plans.length > 0 && (
        <div
          className="history-link"
          onClick={() => router.push('/client/payments/history')}
        >
          View Payment History →
        </div>
      )}
    </div>
  );
}

export default withClientLayout(ClientPayments);
