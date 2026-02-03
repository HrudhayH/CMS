import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getDashboardStats } from '../../services/api';

// Stat card icons
const ProjectIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ActiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CompletedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClientIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StaffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const statCards = stats ? [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: ProjectIcon,
      iconClass: 'stat-icon-primary'
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: ActiveIcon,
      iconClass: 'stat-icon-warning'
    },
    {
      label: 'Completed Projects',
      value: stats.completedProjects,
      icon: CompletedIcon,
      iconClass: 'stat-icon-success'
    },
    {
      label: 'Total Clients',
      value: stats.totalClients,
      icon: ClientIcon,
      iconClass: 'stat-icon-info'
    },
    {
      label: 'Total Staff',
      value: stats.totalStaff,
      icon: StaffIcon,
      iconClass: 'stat-icon-primary'
    }
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to the CMS Admin Portal</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-6)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: 'var(--spacing-12)' 
        }}>
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-8)' }}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="stat-card">
                <div className={`stat-icon ${card.iconClass}`}>
                  <Icon />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions Card */}
      {!loading && !error && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              <a href="/admin/projects" className="btn btn-primary">
                <ProjectIcon />
                Manage Projects
              </a>
              <a href="/admin/clients" className="btn btn-secondary">
                <ClientIcon />
                Manage Clients
              </a>
              <a href="/admin/staff" className="btn btn-secondary">
                <StaffIcon />
                Manage Staff
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Use AdminLayout for this page
Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
