import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getDashboardStats } from '../../services/api';
import { Card, PageHeader, Button, Loader, Alert } from '../../components';

// KPI Icons
const ClientsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ActiveProjectsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const RevenueIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const PaymentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const ProjectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const StaffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const kpis = stats ? [
    {
      label: 'Total Clients',
      value: stats.totalClients,
      secondary: 'Across all regions',
      icon: ClientsIcon,
      color: 'var(--color-primary-500)',
      bg: 'var(--color-primary-50)'
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      secondary: 'In development',
      icon: ActiveProjectsIcon,
      color: 'var(--color-success-500)',
      bg: 'var(--color-success-50)'
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue || 0),
      secondary: 'This month so far',
      icon: RevenueIcon,
      color: 'var(--color-info-500)',
      bg: 'var(--color-info-50)'
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPayments || 0,
      secondary: 'Phases requiring attention',
      icon: PaymentIcon,
      color: 'var(--color-error-500)',
      bg: 'var(--color-error-50)'
    }
  ] : [];

  return (
    <div className="dashboard-container">
      <style jsx>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-6);
          margin-bottom: var(--spacing-8);
        }

        .kpi-card {
          background: white;
          padding: var(--spacing-6);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-gray-200);
          box-shadow: var(--shadow-sm);
        }

        .kpi-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-4);
        }

        .kpi-label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-gray-500);
          margin-bottom: var(--spacing-1);
        }

        .kpi-value {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-gray-900);
          margin-bottom: var(--spacing-1);
        }

        .kpi-secondary {
          font-size: var(--font-size-xs);
          color: var(--color-gray-400);
        }

        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <PageHeader
        title="Dashboard"
        subtitle="Manage your agency operations and performance"
        actions={
          <Button variant="secondary" onClick={fetchStats} size="sm">
            Refresh Data
          </Button>
        }
      />

      {error && <Alert type="error" message={error} style={{ marginBottom: 'var(--spacing-6)' }} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-20)' }}>
          <Loader size="lg" />
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="kpi-grid">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className="kpi-card">
                  <div className="kpi-icon-wrapper" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                    <Icon />
                  </div>
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-secondary">{kpi.secondary}</div>
                </div>
              );
            })}
          </div>

          <Card title="Quick Management">
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
              <Button onClick={() => window.location.href = '/admin/projects'} variant="secondary">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ProjectIcon />
                  Manage Projects
                </div>
              </Button>
              <Button onClick={() => window.location.href = '/admin/clients'} variant="secondary">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClientsIcon />
                  Manage Clients
                </div>
              </Button>
              <Button onClick={() => window.location.href = '/admin/staff'} variant="secondary">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StaffIcon />
                  Manage Staff
                </div>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
