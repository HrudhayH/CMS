import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (!s) return 'badge-neutral';

    // Green -> Active
    if (s.includes('active') || s === 'success' || s === 'open' || s === 'paid') return 'badge-success';

    // Blue -> In Progress
    if (s.includes('progress') || s === 'new' || s === 'sent') return 'badge-info';

    // Yellow -> On Hold
    if (s.includes('hold') || s === 'pending' || s === 'warning' || s === 'on hold') return 'badge-warning';

    // Grey -> Completed
    if (s.includes('completed') || s === 'closed' || s === 'delivered' || s === 'archived' || s === 'cancelled') return 'badge-completed';

    // Default to neutral (grey)
    return 'badge-neutral';
  };

  return (
    <span className={`badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
