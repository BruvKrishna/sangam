import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status, label }) {
  if (!status) return null;
  const key = status.toLowerCase().replace(/ /g, '_');
  const colorClass = STATUS_COLORS[key] || 'bg-slate-100 text-slate-800';
  const displayText = label || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
      {displayText}
    </span>
  );
}
