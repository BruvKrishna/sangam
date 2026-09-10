import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckSquare, AlertTriangle, Clock, Calendar,
  BrainCircuit, ArrowRight, Layers, Zap, Shield, BarChart3
} from 'lucide-react';
import KPICard from '../components/common/KPICard';
import ChartCard from '../components/common/ChartCard';
import StatusBadge from '../components/common/StatusBadge';
import DepartmentChart from '../components/charts/DepartmentChart';
import PriorityChart from '../components/charts/PriorityChart';
import BlockHoursChart from '../components/charts/BlockHoursChart';
import AssetAvailabilityChart from '../components/charts/AssetAvailabilityChart';
import { fetchDashboardSummary } from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchDashboardSummary().then(res => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!data) return null;

  const kpis = data.kpis || {};
  const charts = data.charts || {};
  const recommendations = data.recommendations || [];
  const planningStatus = data.planning_status || {};

  // Transform chart data for components
  const deptData = (charts.tasks_by_department || []).map(d => ({
    name: d.department,
    count: d.count,
  }));

  const priorityData = (charts.tasks_by_priority || []).map(d => ({
    name: d.category,
    value: d.count,
  }));

  const blockHoursData = (charts.block_hours_by_day || []).map(d => ({
    day: d.date.slice(5), // MM-DD
    hours: d.hours,
  }));

  const assetData = (charts.asset_availability || []).map(d => ({
    time: d.date.slice(5),
    availability: d.availability,
    target: 90,
  }));

  const priorityColorMap = {
    HIGH: 'border-red-500 bg-red-50',
    MEDIUM: 'border-amber-500 bg-amber-50',
    LOW: 'border-blue-500 bg-blue-50',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operational Dashboard</h1>
          <p className="text-slate-500">AI-assisted maintenance planning overview</p>
        </div>
        <button
          onClick={() => navigate('/planner')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          Go to Block Planner
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/tasks')}>
          <KPICard title="Total Tasks" value={kpis.total_tasks || 0} icon={Layers} color="blue" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/tasks?status=overdue')}>
          <KPICard title="Critical Tasks" value={kpis.critical_tasks || 0} icon={AlertTriangle} color="red" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/tasks?status=overdue')}>
          <KPICard title="Overdue Tasks" value={kpis.overdue_tasks || 0} icon={Clock} color="amber" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/planner')}>
          <KPICard title="Planned Blocks" value={kpis.planned_blocks || 0} icon={Calendar} color="green" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/conflicts')}>
          <KPICard title="Conflicts Detected" value={kpis.conflicts_detected || 0} icon={Zap} color="red" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/assets')}>
          <KPICard title="Assets Under Maintenance" value={kpis.assets_under_maintenance || 0} icon={Shield} color="slate" />
        </div>
        <KPICard title="Est. Block Hours" value={kpis.estimated_block_hours || 0} icon={BarChart3} color="blue" />
        <div className="cursor-pointer" onClick={() => navigate('/schedule')}>
          <KPICard title="Tasks Scheduled" value={kpis.tasks_scheduled || 0} icon={CheckSquare} color="green" />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Tasks by Department" description="Maintenance task distribution across departments">
          <DepartmentChart data={deptData} />
        </ChartCard>
        <ChartCard title="Priority Distribution" description="AI-calculated priority categories">
          <PriorityChart data={priorityData} />
        </ChartCard>
        <ChartCard title="Block Hours by Day" description="Estimated maintenance hours over planning horizon">
          <BlockHoursChart data={blockHoursData} />
        </ChartCard>
      </div>

      {/* Charts Row 2 & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Asset Availability" description="System-wide asset availability trend vs target">
            <AssetAvailabilityChart data={assetData} />
          </ChartCard>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">AI Recommendations</h3>
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {recommendations.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Run optimization to generate recommendations.</p>
            )}
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm border-l-4 cursor-pointer hover:shadow-sm transition-all flex justify-between items-start gap-2 ${priorityColorMap[rec.priority] || 'border-slate-300 bg-slate-50'}`}
                onClick={() => rec.task_ids?.[0] && navigate(`/tasks/${rec.task_ids[0]}`)}
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{rec.priority}</span>
                  <p className="text-slate-700 mt-0.5">{rec.message}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planning Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-bold text-slate-800 mb-4">Current Planning Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Planning Horizon</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{planningStatus.planning_horizon || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Last Optimization</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {planningStatus.last_optimization_run === 'Not yet run' ? (
                <span className="text-amber-600">Not yet run</span>
              ) : planningStatus.last_optimization_run ? (
                new Date(planningStatus.last_optimization_run).toLocaleTimeString()
              ) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Tasks Considered</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{planningStatus.tasks_considered || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Constraints Evaluated</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{planningStatus.constraints_evaluated || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Schedule Status</p>
            <StatusBadge status={planningStatus.schedule_status === 'Schedule generated' ? 'completed' : 'pending'} label={planningStatus.schedule_status || 'N/A'} />
          </div>
        </div>
      </div>
    </div>
  );
}
