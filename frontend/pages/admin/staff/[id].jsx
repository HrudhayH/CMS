import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../layouts/AdminLayout';
import { Alert } from '../../../components';
import { getStaffMember } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function StaffDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getStaffMember(id);
        setData(response.data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load staff details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      'Active': { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      'Inactive': { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
    };
    return colors[status] || colors['Active'];
  };

  const getProjectStatusColor = (status) => {
    const colors = {
      'New': { bg: '#f1f5f9', text: '#475569' },
      'In Progress': { bg: '#dbeafe', text: '#1e40af' },
      'On Hold': { bg: '#fef3c7', text: '#92400e' },
      'Completed': { bg: '#d1fae5', text: '#065f46' }
    };
    return colors[status] || colors['New'];
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="loading-spinner loading-spinner-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert type="error" message={error} />
        <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: '16px' }}>
          <BackIcon /> Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { staff, projects } = data;
  const statusColor = getStatusColor(staff.status);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.push('/admin/staff')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: 'var(--color-primary)',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: '4px 0', marginBottom: '16px'
          }}
        >
          <BackIcon /> Back to Staff
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #dc2626)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '700', flexShrink: 0
          }}>
            {getInitials(staff.name)}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>{staff.name}</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {staff.employeeCode && (
                <span style={{
                  padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                  background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe'
                }}>{staff.employeeCode}</span>
              )}
              <span style={{
                padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.border}`
              }}>{staff.status}</span>
              {staff.role && <span style={{ fontSize: '14px', color: '#6b7280' }}>{staff.role}</span>}
              {staff.department && <span style={{ fontSize: '14px', color: '#6b7280' }}>• {staff.department}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Contact Info */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '24px',
          border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MailIcon /><span style={{ fontSize: '14px' }}>{staff.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PhoneIcon /><span style={{ fontSize: '14px' }}>{staff.phone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '24px',
          border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>{projects?.length || 0}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Total Projects</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>{projects?.filter(p => p.status === 'Completed').length || 0}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Completed</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{projects?.filter(p => p.status === 'In Progress').length || 0}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>In Progress</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Joined</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatDate(staff.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div style={{
        background: 'white', borderRadius: '12px',
        border: '1px solid var(--color-border)', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Assigned Projects ({projects?.length || 0})</h3>
        </div>

        {projects && projects.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Project</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Clients</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const pColor = getProjectStatusColor(project.status);
                return (
                  <tr key={project._id} style={{
                    borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.2s ease'
                  }}
                    onClick={() => router.push(`/admin/projects`)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{project.title}</div>
                      {project.projectCode && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{project.projectCode}</div>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                        backgroundColor: pColor.bg, color: pColor.text
                      }}>{project.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {project.assignedClients?.map(c => c.name).join(', ') || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {formatDate(project.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No projects assigned to this staff member.
          </div>
        )}
      </div>
    </div>
  );
}

StaffDetail.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
