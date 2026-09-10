export const STATUS_COLORS = {
  // Task statuses
  planned: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  conflict: 'bg-red-100 text-red-800',
  pending: 'bg-slate-100 text-slate-800',
  pending_approval: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-gray-100 text-gray-500',

  // Priority levels
  critical: 'bg-red-100 text-red-800',
  high: 'bg-amber-100 text-amber-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-green-100 text-green-800',

  // Approval statuses
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  modified: 'bg-amber-100 text-amber-800',
  sent_back: 'bg-orange-100 text-orange-800',

  // Condition statuses
  good: 'bg-green-100 text-green-800',
  fair: 'bg-blue-100 text-blue-800',
  poor: 'bg-amber-100 text-amber-800',

  // Conflict
  open: 'bg-red-100 text-red-800',
  resolved: 'bg-green-100 text-green-800',

  // Optimization
  optimal: 'bg-green-100 text-green-800',
  feasible: 'bg-blue-100 text-blue-800',
  infeasible: 'bg-red-100 text-red-800',
};

export const DEPT_COLORS = {
  'DEPT-ENG': { bg: '#3b82f6', text: '#1e40af', light: '#dbeafe' },
  'DEPT-SNT': { bg: '#f59e0b', text: '#92400e', light: '#fef3c7' },
  'DEPT-TRC': { bg: '#10b981', text: '#065f46', light: '#d1fae5' },
  'DEPT-GEN': { bg: '#8b5cf6', text: '#5b21b6', light: '#ede9fe' },
};

export const DEPT_NAMES = {
  'DEPT-ENG': 'Engineering',
  'DEPT-SNT': 'S&T',
  'DEPT-TRC': 'Traction/Electrical',
  'DEPT-GEN': 'General',
};
