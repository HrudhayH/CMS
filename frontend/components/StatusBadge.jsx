export default function StatusBadge({ status }) {
  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '-');
    const statusMap = {
      'active': 'badge-active',
      'paused': 'badge-paused',
      'completed': 'badge-completed',
      'new': 'badge-new',
      'in-progress': 'badge-in-progress',
      'on-hold': 'badge-on-hold',
    };
    return statusMap[statusLower] || 'badge-info';
  };

  return (
    <span className={`badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}
