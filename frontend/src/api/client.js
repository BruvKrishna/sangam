// SANGAM Frontend API Client
// Connects to FastAPI backend at localhost:8000 via Vite proxy
// Falls back to embedded mock data if backend is unavailable

const BASE_URL = '/api';

async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[SANGAM] API call failed: ${url}`, error.message);
    throw error;
  }
}

// ============ Dashboard ============
export const fetchDashboardSummary = async () => {
  try {
    return await apiFetch('/dashboard/summary');
  } catch {
    return FALLBACK.dashboard;
  }
};

// ============ Tasks ============
export const fetchTasks = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.department) params.set('department', filters.department);
    if (filters.section) params.set('section', filters.section);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.planning_date) params.set('planning_date', filters.planning_date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch(`/tasks${query}`);
  } catch {
    return FALLBACK.tasks;
  }
};

export const fetchTask = async (id) => {
  try {
    return await apiFetch(`/tasks/${id}`);
  } catch {
    return null;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  return apiFetch(`/tasks/${taskId}/update-status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
};

// ============ Assets ============
export const fetchAssets = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.asset_type) params.set('asset_type', filters.asset_type);
    if (filters.section) params.set('section', filters.section);
    if (filters.condition) params.set('condition', filters.condition);
    if (filters.search) params.set('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch(`/assets${query}`);
  } catch {
    return FALLBACK.assets;
  }
};

export const fetchAsset = async (id) => {
  return apiFetch(`/assets/${id}`);
};

// ============ Departments ============
export const fetchDepartments = async () => {
  try {
    return await apiFetch('/departments');
  } catch {
    return FALLBACK.departments;
  }
};

// ============ Sections ============
export const fetchSections = async () => {
  try {
    return await apiFetch('/sections');
  } catch {
    return { sections: [] };
  }
};

// ============ Optimization ============
export const runOptimization = async (params) => {
  return apiFetch('/optimization/run', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const fetchOptimizationStatus = async () => {
  try {
    return await apiFetch('/optimization/status');
  } catch {
    return { status: 'READY', last_run: null };
  }
};

export const fetchSchedule = async () => {
  try {
    return await apiFetch('/schedule');
  } catch {
    return { schedules: [], last_updated: null };
  }
};

// ============ Conflicts ============
export const fetchConflicts = async () => {
  try {
    return await apiFetch('/conflicts');
  } catch {
    return { conflicts: [], summary: { total: 0, high: 0, medium: 0, low: 0, resolved: 0, open: 0 } };
  }
};

export const resolveConflict = async (conflictId, action) => {
  return apiFetch(`/conflicts/${conflictId}/resolve?action=${action}`, { method: 'POST' });
};

// ============ What-If ============
export const runWhatIf = async (scenario) => {
  return apiFetch('/what-if', {
    method: 'POST',
    body: JSON.stringify(scenario),
  });
};

// ============ Priority ============
export const calculatePriority = async (taskId) => {
  return apiFetch('/priority/calculate', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
};

export const fetchPriorityFormula = async () => {
  try {
    return await apiFetch('/priority/formula');
  } catch {
    return FALLBACK.formula;
  }
};

// ============ Approval ============
export const fetchPendingApprovals = async () => {
  try {
    return await apiFetch('/approval/pending');
  } catch {
    return { pending: [], summary: { total: 0, pending: 0, approved: 0, rejected: 0 } };
  }
};

export const fetchAllApprovals = async () => {
  try {
    return await apiFetch('/approval/all');
  } catch {
    return { entries: [], summary: { total: 0, pending: 0, approved: 0, rejected: 0 } };
  }
};

export const submitApproval = async (scheduleId, action, approvedBy = 'Demo User', comments = '') => {
  return apiFetch(`/approval/${scheduleId}/${action}`, {
    method: 'POST',
    body: JSON.stringify({ approved_by: approvedBy, comments }),
  });
};

// ============ Reports ============
export const fetchReportTypes = async () => {
  try {
    return await apiFetch('/reports/types');
  } catch {
    return FALLBACK.reportTypes;
  }
};

export const generateReport = async (reportType, planningDate) => {
  return apiFetch('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ report_type: reportType, planning_date: planningDate }),
  });
};

// ============ Data Sources ============
export const fetchDataSources = async () => {
  try {
    return await apiFetch('/data-sources');
  } catch {
    return FALLBACK.dataSources;
  }
};

// ============ Fallback Data ============
const FALLBACK = {
  dashboard: {
    kpis: {
      total_tasks: 66, critical_tasks: 15, overdue_tasks: 18, planned_blocks: 0,
      conflicts_detected: 0, assets_under_maintenance: 8, estimated_block_hours: 98.4, tasks_scheduled: 10,
    },
    charts: {
      tasks_by_department: [
        { department: 'Engineering', count: 22 },
        { department: 'S&T', count: 20 },
        { department: 'Traction/Electrical', count: 18 },
        { department: 'General', count: 6 },
      ],
      tasks_by_priority: [
        { category: 'Critical', count: 8 },
        { category: 'High', count: 18 },
        { category: 'Medium', count: 25 },
        { category: 'Low', count: 15 },
      ],
      tasks_by_status: [
        { status: 'pending', count: 28 },
        { status: 'overdue', count: 12 },
        { status: 'scheduled', count: 10 },
        { status: 'completed', count: 11 },
        { status: 'in_progress', count: 4 },
        { status: 'cancelled', count: 1 },
      ],
      block_hours_by_day: [
        { date: '2026-09-10', hours: 11.8 },
        { date: '2026-09-11', hours: 17.2 },
        { date: '2026-09-12', hours: 7.0 },
        { date: '2026-09-13', hours: 10.0 },
        { date: '2026-09-14', hours: 13.2 },
        { date: '2026-09-15', hours: 11.0 },
        { date: '2026-09-16', hours: 11.0 },
        { date: '2026-09-17', hours: 17.2 },
      ],
      asset_availability: [
        { date: '2026-09-10', availability: 88 },
        { date: '2026-09-11', availability: 89 },
        { date: '2026-09-12', availability: 81 },
        { date: '2026-09-13', availability: 82 },
        { date: '2026-09-14', availability: 83 },
        { date: '2026-09-15', availability: 85 },
        { date: '2026-09-16', availability: 86 },
        { date: '2026-09-17', availability: 87 },
      ],
      overdue_vs_upcoming: { overdue: 18, upcoming: 24 },
    },
    recommendations: [
      { priority: 'HIGH', message: 'Multiple overdue activities can be combined in a coordinated block.', task_ids: [], type: 'coordination' },
      { priority: 'MEDIUM', message: 'Compatible tasks can share a single block window.', task_ids: [], type: 'efficiency' },
    ],
    planning_status: {
      planning_horizon: '2026-09-10 to 2026-09-17',
      last_optimization_run: 'Not yet run',
      tasks_considered: 66,
      constraints_evaluated: 198,
      schedule_status: 'Optimization available',
    },
  },
  tasks: {
    tasks: [],
    total: 0,
    sections: ['SEC-A', 'SEC-B', 'SEC-C', 'SEC-D', 'SEC-E', 'SEC-F'],
    departments: [
      { id: 'DEPT-ENG', name: 'Engineering' },
      { id: 'DEPT-SNT', name: 'S&T' },
      { id: 'DEPT-TRC', name: 'Traction/Electrical' },
      { id: 'DEPT-GEN', name: 'General' },
    ],
  },
  assets: { assets: [], total: 0, charts: {}, filters: {} },
  departments: { departments: [], coordination_opportunities: [] },
  formula: {
    formula: 'Priority Score = 0.30 × Criticality + 0.25 × Urgency + 0.20 × Overdue + 0.15 × Asset Impact + 0.10 × Safety Relevance',
    weights: [
      { factor: 'Criticality', weight: 0.30, description: 'How critical the asset/task is for train operations' },
      { factor: 'Urgency', weight: 0.25, description: 'How urgently the maintenance must be performed' },
      { factor: 'Overdue', weight: 0.20, description: 'How overdue the maintenance activity is' },
      { factor: 'Asset Impact', weight: 0.15, description: 'Impact on the associated asset if not maintained' },
      { factor: 'Safety Relevance', weight: 0.10, description: 'Relevance to safety-critical operations' },
    ],
    note: 'These are illustrative prototype weights and do not represent official Indian Railways policy.',
  },
  reportTypes: [
    { id: 'daily_block_plan', name: 'Daily Block Plan', description: 'Scheduled blocks for a day' },
    { id: 'weekly_maintenance', name: 'Weekly Maintenance Plan', description: 'Week overview' },
    { id: 'overdue_maintenance', name: 'Overdue Maintenance Report', description: 'Overdue tasks' },
    { id: 'conflict_report', name: 'Conflict Report', description: 'Scheduling conflicts' },
    { id: 'optimization_summary', name: 'Optimization Summary', description: 'Optimization results' },
    { id: 'asset_availability', name: 'Asset Availability Summary', description: 'Asset status overview' },
  ],
  dataSources: {
    sources: [
      { id: 'TMS', name: 'Train Management System', description: 'Train schedules and movement', data_types: ['Schedules', 'Track occupancy'], sync_status: 'Simulated', records: 15420 },
      { id: 'SMMS', name: 'Section Maintenance Management System', description: 'Work orders and maintenance records', data_types: ['Work orders', 'Inspections'], sync_status: 'Simulated', records: 8750 },
      { id: 'TDMS', name: 'Track Data Management System', description: 'Track geometry and condition', data_types: ['Track geometry', 'Rail wear'], sync_status: 'Simulated', records: 23100 },
      { id: 'COA', name: 'Control Office Application', description: 'Traffic and block management', data_types: ['Block requests', 'Traffic blocks'], sync_status: 'Simulated', records: 4200 },
      { id: 'BDMS', name: 'Bridge & Drainage Management System', description: 'Bridge inspections', data_types: ['Bridge inspections', 'Structural assessments'], sync_status: 'Simulated', records: 3600 },
    ],
    pipeline: [
      { step: 1, name: 'Data Adapter', description: 'Connects to each source system' },
      { step: 2, name: 'Normalization', description: 'Converts to unified schema' },
      { step: 3, name: 'Validation', description: 'Checks data quality' },
      { step: 4, name: 'SANGAM Database', description: 'Stores normalized data' },
      { step: 5, name: 'AI + Optimizer', description: 'Processes data for planning' },
    ],
    note: 'Conceptual data sources for prototype.',
  },
};
