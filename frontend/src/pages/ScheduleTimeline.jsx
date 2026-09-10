import React, { useState, useEffect } from 'react';
import { fetchSchedule, runOptimization } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Tabs from '../components/common/Tabs';
import { Calendar, Clock, Play, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScheduleTimeline() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('day');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSchedule();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunOptimization = async () => {
    try {
      setOptimizing(true);
      await runOptimization({ planning_date: '2026-09-10' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to generate schedule');
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading maintenance schedule timeline..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const schedules = data?.schedules || [];
  const lastUpdated = data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : 'Not yet updated';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Schedule & Maintenance Timeline</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">v1.1</span>
          </div>
          <p className="text-slate-500 text-sm">Chronological view of optimized maintenance block schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">Last update: {lastUpdated}</span>
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh schedule"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/planner')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Block Planner
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Scheduled Maintenance Blocks Found</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            The schedule timeline is populated after running the CP-SAT optimization engine.
          </p>
          <button
            onClick={handleRunOptimization}
            disabled={optimizing}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            {optimizing ? <LoadingSpinner size="sm" /> : <Play className="w-4 h-4" />}
            {optimizing ? 'Running Optimization...' : 'Run Optimization Now'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3 flex justify-between items-center bg-slate-50">
            <Tabs
              tabs={[
                { id: 'day', label: 'Day View' },
                { id: 'week', label: 'Week View' }
              ]}
              activeTab={view}
              onChange={setView}
            />
            <span className="text-xs text-slate-500 font-medium">{schedules.length} block entries scheduled</span>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {schedules.map((item, index) => {
                const priority = item.priority_score ?? item.priority ?? 0;
                const dept = item.department_name || item.department_id || item.department || 'General';
                const date = item.planning_date || item.date || '2026-09-10';

                return (
                  <div
                    key={item.id || index}
                    onClick={() => item.task_id && navigate(`/tasks/${item.task_id}`)}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <div className="w-48 shrink-0">
                      <div className="flex items-center gap-1.5 text-blue-600 font-mono font-bold text-base">
                        <Clock className="w-4 h-4" />
                        {item.start_time} – {item.end_time}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{item.task_id}</span>
                        <span className="font-semibold text-slate-800 text-sm">{item.task_name}</span>
                        <StatusBadge status={item.status || item.approval_status || 'scheduled'} />
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                          Score: {priority.toFixed ? priority.toFixed(1) : priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {dept} • Section: <span className="font-mono font-medium text-slate-700">{item.section}</span> • Asset: <span className="font-mono font-medium text-slate-700">{item.asset_id || item.asset}</span>
                      </p>
                    </div>

                    <div className="shrink-0">
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
