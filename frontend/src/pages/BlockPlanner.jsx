import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, AlertTriangle, RotateCcw, Calendar, Clock, CheckSquare, Zap } from 'lucide-react';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import GanttChart from '../components/planning/GanttChart';
import { fetchTasks, fetchSections, runOptimization } from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DEPT_COLORS = {
  'DEPT-ENG': '#3b82f6',
  'DEPT-SNT': '#f59e0b',
  'DEPT-TRC': '#10b981',
  'DEPT-GEN': '#8b5cf6',
};
const DEPT_NAMES = { 'DEPT-ENG': 'Engineering', 'DEPT-SNT': 'S&T', 'DEPT-TRC': 'Traction/Electrical', 'DEPT-GEN': 'General' };

export default function BlockPlanner() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState(null);

  // Controls
  const [planningDate, setPlanningDate] = useState('2026-09-10');
  const [deptFilter, setDeptFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  useEffect(() => {
    Promise.all([fetchTasks(), fetchSections()]).then(([taskData, secData]) => {
      setTasks(taskData.tasks || []);
      setDepartments(taskData.departments || []);
      setSections(secData.sections || []);
      setLoading(false);
    });
  }, []);

  const handleRunOptimization = async () => {
    setOptimizing(true);
    try {
      const params = {
        planning_date: planningDate,
        department_filter: deptFilter || null,
        section_filter: sectionFilter || null,
      };
      const res = await runOptimization(params);
      setResult(res);
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setDeptFilter('');
    setSectionFilter('');
  };

  if (loading) return <LoadingSpinner message="Loading planner data..." />;

  const scheduled = result?.scheduled || [];
  const unscheduled = result?.unscheduled || [];
  const conflicts = result?.conflicts || [];
  const stats = result?.stats || {};

  // Transform scheduled tasks for Gantt chart
  const ganttData = scheduled.map(s => ({
    id: s.task_id,
    name: s.task_name || s.task_id,
    department: s.department_id,
    departmentName: s.department_name || DEPT_NAMES[s.department_id] || s.department_id,
    section: s.section,
    startTime: s.start_time,
    endTime: s.end_time,
    priority: s.priority_score,
    color: DEPT_COLORS[s.department_id] || '#6b7280',
    compatibilityGroup: s.compatibility_group,
    assetId: s.asset_id,
    duration: s.duration_minutes,
  }));

  // Calculate stats
  const totalBlockMinutes = scheduled.reduce((sum, s) => {
    const [sh, sm] = s.start_time.split(':').map(Number);
    const [eh, em] = s.end_time.split(':').map(Number);
    return sum + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);
  const totalBlockHours = (totalBlockMinutes / 60).toFixed(1);
  const utilization = scheduled.length > 0 ? Math.min(100, Math.round((totalBlockMinutes / (16 * 60)) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Block Planner</h1>
        <p className="text-slate-500">Configure parameters and run AI-assisted optimization to generate a block plan.</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Planning Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Planning Date</label>
            <input
              type="date" value={planningDate}
              onChange={e => setPlanningDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Section</label>
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Sections</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleRunOptimization} disabled={optimizing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              {optimizing ? <LoadingSpinner size="sm" /> : <Play className="w-4 h-4" />}
              {optimizing ? 'Optimizing...' : 'Run Optimization'}
            </button>
            <button onClick={handleReset}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <RotateCcw className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Tasks Scheduled" value={stats.scheduled_count || 0} icon={CheckSquare} color="green" />
            <KPICard title="Conflicts" value={conflicts.length} icon={AlertTriangle} color={conflicts.length > 0 ? 'red' : 'green'} />
            <KPICard title="Block Hours" value={totalBlockHours} icon={Clock} color="blue" />
            <KPICard title="Utilization" value={`${utilization}%`} icon={Zap} color="amber" />
          </div>

          {/* Optimization Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-medium text-green-800">Status: {stats.status}</span>
              <span className="text-green-600 text-sm ml-3">
                Solved in {stats.solve_time_seconds?.toFixed(3)}s | Objective: {stats.objective_value}
              </span>
            </div>
            <button onClick={() => navigate('/review')} className="ml-auto bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Review & Approve
            </button>
          </div>

          {/* Gantt Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4">Generated Block Plan — {planningDate}</h3>
            <GanttChart data={ganttData} onTaskClick={(task) => navigate(`/tasks/${task.id}`)} />
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800">Scheduled Tasks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium">Task</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium">Department</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium">Section</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium">Asset</th>
                    <th className="text-center px-4 py-2.5 text-slate-600 font-medium">Block Window</th>
                    <th className="text-center px-4 py-2.5 text-slate-600 font-medium">Priority</th>
                    <th className="text-center px-4 py-2.5 text-slate-600 font-medium">Group</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduled.map(s => (
                    <tr key={s.task_id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/tasks/${s.task_id}`)}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{s.task_name || s.task_id}</div>
                        <div className="text-xs text-slate-400 font-mono">{s.task_id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[s.department_id] || '#6b7280' }} />
                          {s.department_name || s.department_id}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{s.section}</td>
                      <td className="px-4 py-3 text-xs">{s.asset_id}</td>
                      <td className="px-4 py-3 text-center font-mono font-medium">{s.start_time} – {s.end_time}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${s.priority_score >= 70 ? 'text-red-600' : s.priority_score >= 50 ? 'text-amber-600' : 'text-blue-600'}`}>
                          {s.priority_score?.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{s.compatibility_group || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unscheduled Tasks */}
          {unscheduled.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <h3 className="text-base font-bold text-amber-800 mb-3">Unscheduled Tasks ({unscheduled.length})</h3>
              <div className="space-y-2">
                {unscheduled.map(u => (
                  <div key={u.task_id} className="flex justify-between items-center text-sm bg-white rounded-lg px-4 py-2 border border-amber-100">
                    <span className="font-mono font-medium text-slate-800">{u.task_id}</span>
                    <span className="text-slate-500">{u.task_name}</span>
                    <span className="text-amber-600 text-xs">{u.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-5">
              <h3 className="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Detected Conflicts ({conflicts.length})
              </h3>
              <div className="space-y-2">
                {conflicts.map((c, idx) => (
                  <div key={idx} className="bg-white rounded-lg px-4 py-3 border border-red-100 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-medium">{c.task_ids?.join(' ↔ ')}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{c.description} — Section {c.section}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.severity?.toLowerCase()} label={c.severity} />
                      <button onClick={() => navigate('/conflicts')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!result && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No Block Plan Generated</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Select a planning date and parameters above, then click "Run Optimization" to generate an AI-optimized block plan using CP-SAT.
          </p>
        </div>
      )}
    </div>
  );
}
