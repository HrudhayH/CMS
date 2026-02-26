import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../layouts/AdminLayout';
import { Alert } from '../../../components';
import { getProject, getPaymentByProject } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projRes, payRes] = await Promise.allSettled([
        getProject(id),
        getPaymentByProject(id)
      ]);
      if (projRes.status === 'fulfilled') {
        setProject(projRes.value.data);
      } else {
        setError('Failed to load project');
      }
      if (payRes.status === 'fulfilled') {
        setPayment(payRes.value.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
  };

  const getStatusStyle = (status) => {
    const map = {
      'New': { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
      'In Progress': { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
      'On Hold': { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
      'Completed': { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
      'Active': { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
      'Inactive': { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
      'PENDING': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
      'PARTIAL': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
      'PAID': { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' }
    };
    const s = map[status] || map['New'];
    return {
      padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
      display: 'inline-block'
    };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>Project not found</h2>
          <button className="btn btn-primary" onClick={() => router.push('/admin/projects')} style={{ marginTop: '16px' }}>
            Back to Projects
          </button>
        </div>
      </AdminLayout>
    );
  }

  const progressPercent = payment && payment.totalAmount > 0
    ? Math.round((payment.totalPaidAmount / payment.totalAmount) * 100)
    : 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary btn-icon" onClick={() => router.push('/admin/projects')}>
            <BackIcon />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>{project.title}</h1>
              <span style={getStatusStyle(project.status)}>{project.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              {project.projectCode && (
                <span style={{
                  fontSize: '12px', fontWeight: '600', color: '#7c3aed',
                  backgroundColor: '#f5f3ff', padding: '2px 10px', borderRadius: '9999px',
                  border: '1px solid #ddd6fe'
                }}>
                  {project.projectCode}
                </span>
              )}
              <span>Created {formatDateShort(project.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <CalendarIcon /> Timeline
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              {formatDateShort(project.startDate)} → {formatDateShort(project.endDate)}
            </p>
          </div>
        </div>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <UsersIcon /> Clients
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              {project.assignedClients?.length || 0}
            </p>
          </div>
        </div>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <UsersIcon /> Staff
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              {project.assignedStaff?.length || 0}
            </p>
          </div>
        </div>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <CreditCardIcon /> Payment
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              {payment ? <span style={getStatusStyle(payment.status)}>{payment.status}</span> : <span style={{ color: 'var(--color-text-muted)' }}>No plan</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Description</h3>
            <p style={{ margin: 0, lineHeight: '1.7', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {project.description}
            </p>
          </div>
        </div>
      )}

      {/* Project Links Section */}
      {(project.referenceLink || project.developmentLink || project.productionLink) && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>Project Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {project.referenceLink && (
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>Reference Link</div>
                  <a
                    href={project.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      color: '#2563eb', fontSize: '14px', fontWeight: '600',
                      textDecoration: 'none', wordBreak: 'break-all'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {project.referenceLink.length > 40 ? project.referenceLink.substring(0, 40) + '...' : project.referenceLink}
                  </a>
                </div>
              )}
              {project.developmentLink && (
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Development Link</div>
                  <a
                    href={project.developmentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      color: '#3b82f6', fontSize: '14px', fontWeight: '600',
                      textDecoration: 'none', wordBreak: 'break-all'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    {project.developmentLink.length > 40 ? project.developmentLink.substring(0, 40) + '...' : project.developmentLink}
                  </a>
                </div>
              )}
              {project.productionLink && (
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '8px' }}>Production Link</div>
                  <a
                    href={project.productionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      color: '#10b981', fontSize: '14px', fontWeight: '600',
                      textDecoration: 'none', wordBreak: 'break-all'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    {project.productionLink.length > 40 ? project.productionLink.substring(0, 40) + '...' : project.productionLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tech Stack */}
      {project.techStack && project.techStack.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Tech Stack</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {project.techStack.map((tech, i) => (
                <span key={i} style={{
                  padding: '6px 14px', fontSize: '13px', fontWeight: '600',
                  color: '#1e40af', backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe', borderRadius: '9999px'
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clients & Staff side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Clients */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Assigned Clients</h3>
          </div>
          {project.assignedClients && project.assignedClients.length > 0 ? (
            <div>
              {project.assignedClients.map((client, index) => (
                <div key={client._id} style={{
                  padding: '14px 20px',
                  borderBottom: index < project.assignedClients.length - 1 ? '1px solid var(--border-color, #e5e7eb)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '700', flexShrink: 0
                  }}>
                    {client.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{client.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{client.email}</div>
                    {client.phone && <div style={{ fontSize: '12px', color: '#6b7280' }}>☎ {client.phone}</div>}
                  </div>
                  <div>
                    {client.clientCode && (
                      <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginRight: '8px' }}>{client.clientCode}</span>
                    )}
                    <span style={getStatusStyle(client.status || 'Active')}>{client.status || 'Active'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No clients assigned</div>
          )}
        </div>

        {/* Staff */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Assigned Staff</h3>
          </div>
          {project.assignedStaff && project.assignedStaff.length > 0 ? (
            <div>
              {project.assignedStaff.map((member, index) => (
                <div key={member._id} style={{
                  padding: '14px 20px',
                  borderBottom: index < project.assignedStaff.length - 1 ? '1px solid var(--border-color, #e5e7eb)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: `hsl(${(index * 137.5) % 360}, 65%, 85%)`,
                    color: `hsl(${(index * 137.5) % 360}, 65%, 35%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '700', flexShrink: 0
                  }}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{member.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{member.email}</div>
                  </div>
                  <div>
                    {member.employeeCode && (
                      <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginRight: '8px' }}>{member.employeeCode}</span>
                    )}
                    <span style={getStatusStyle(member.status || 'Active')}>{member.status || 'Active'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No staff assigned</div>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      {payment && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Payment Summary</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/admin/payments/${payment._id}`)}>
              View Details →
            </button>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total</p>
                <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{formatCurrency(payment.totalAmount)}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Paid</p>
                <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#059669' }}>{formatCurrency(payment.totalPaidAmount)}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Pending</p>
                <p style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#d97706' }}>{formatCurrency(payment.totalAmount - payment.totalPaidAmount)}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Type</p>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{payment.paymentType?.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payment Progress</span>
                <span style={{ fontWeight: '600' }}>{progressPercent}%</span>
              </div>
              <div style={{
                height: '8px', backgroundColor: '#f3f4f6',
                borderRadius: '4px', overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: progressPercent === 100 ? '#059669' : '#667eea',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Phases */}
            {payment.phases && payment.phases.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phases</h4>
                {payment.phases.map((phase, i) => (
                  <div key={phase._id || i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < payment.phases.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div>
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>{phase.phaseName}</span>
                      {phase.dueDate && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '10px' }}>Due: {formatDateShort(phase.dueDate)}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatCurrency(phase.calculatedAmount)}</span>
                      <span style={getStatusStyle(phase.status)}>{phase.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
