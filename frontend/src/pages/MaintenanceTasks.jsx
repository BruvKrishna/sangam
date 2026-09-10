import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
import FilterBar from '../components/common/FilterBar';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import { fetchTasks } from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export default function MaintenanceTasks() {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchTasks().then(data => {
      setAllTasks(data.tasks || []);
      setDepartments(data.departments || []);
      setSections(data.sections || []);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const filteredTasks = allTasks.filter(t => {
    const matchSearch = !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.asset_name || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || t.department_id === deptFilter;
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchSection = !sectionFilter || t.section === sectionFilter;
    return matchSearch && matchDept && matchStatus && matchSection;
  });

  const getPriorityColor = (score) => {
    if (score >= 80) return 'text-red-600 font-bold';
    if (score >= 60) return 'text-amber-600 font-bold';
    if (score >= 40) return 'text-blue-600 font-medium';
    return 'text-green-600';
  };

  const columns = [
    { key: 'id', label: 'Task ID', render: (val) => <span className="font-mono font-medium text-slate-900">{val}</span> },
    { key: 'name', label: 'Task Name', render: (val) => <span className="text-slate-700">{val}</span> },
    { key: 'department_name', label: 'Department' },
    { key: 'asset_name', label: 'Asset' },
    { key: 'section', label: 'Section', render: (val) => <span className="font-mono text-xs">{val}</span> },
    { key: 'priority_score', label: 'Priority', sortable: true, render: (val) => (
      <span className={getPriorityColor(val)}>{val?.toFixed(1)}</span>
    )},
    { key: 'required_duration_minutes', label: 'Duration', render: (val) => {
      const h = Math.floor(val / 60);
      const m = val % 60;
      return <span className="text-slate-600 text-sm">{h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}m` : ''}</span>;
    }},
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  const filters = [
    {
      label: 'All Departments',
      value: deptFilter,
      onChange: setDeptFilter,
      options: departments.map(d => ({ value: d.id, label: d.name })),
    },
    {
      label: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      label: 'All Sections',
      value: sectionFilter,
      onChange: setSectionFilter,
      options: sections.map(s => ({ value: s, label: s })),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading tasks..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Maintenance Tasks</h1>
        <p className="text-slate-500">View and manage all maintenance activities across departments. Click a task for details.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <FilterBar filters={filters} />
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Search task ID, name, asset..." />
        </div>
      </div>

      <div className="text-sm text-slate-500">
        Showing {filteredTasks.length} of {allTasks.length} tasks
        {(deptFilter || statusFilter || sectionFilter || search) && (
          <button onClick={() => { setDeptFilter(''); setStatusFilter(''); setSectionFilter(''); setSearch(''); }} className="ml-3 text-blue-600 hover:text-blue-800">
            Clear filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredTasks}
        onRowClick={(row) => navigate(`/tasks/${row.id}`)}
      />
    </div>
  );
}
