import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { fetchConflicts, resolveConflict } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import KPICard from '../components/common/KPICard';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
  resolved: '#10b981'
};

export default function ConflictCenter() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchConflicts();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load conflicts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (conflictId, action) => {
    try {
      setActionLoading(conflictId);
      await resolveConflict(conflictId, action);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve conflict: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading conflicts..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!data) return <EmptyState message="No conflicts found." />;

  const { conflicts, summary } = data;

  const chartData = [
    { name: 'High', value: summary.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: summary.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: summary.low, color: SEVERITY_COLORS.low }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Conflict Center</h1>
        <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-sm font-medium">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="Total" value={summary.total} icon={AlertCircle} color="slate" />
        <KPICard title="High Severity" value={summary.high} icon={ShieldAlert} color="red" />
        <KPICard title="Medium Severity" value={summary.medium} icon={AlertTriangle} color="amber" />
        <KPICard title="Low Severity" value={summary.low} icon={Clock} color="blue" />
        <KPICard title="Resolved" value={summary.resolved} icon={CheckCircle} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Active Conflicts</h2>
          {conflicts.length === 0 ? (
            <EmptyState message="Hooray! No active conflicts found." />
          ) : (
            conflicts.map(conflict => (
              <div key={conflict.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-slate-500">#{conflict.id}</span>
                      <StatusBadge status={conflict.severity} label={conflict.severity.toUpperCase()} />
                    </div>
                    <h3 className="font-semibold text-slate-800">Overlap: {conflict.overlap_time}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Task A</p>
                    <p className="font-medium text-slate-800">{conflict.task_a.name}</p>
                    <p className="text-sm text-slate-600">{conflict.task_a.dept} • {conflict.task_a.section}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Task B</p>
                    <p className="font-medium text-slate-800">{conflict.task_b.name}</p>
                    <p className="text-sm text-slate-600">{conflict.task_b.dept} • {conflict.task_b.section}</p>
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  <span className="font-semibold">Recommendation:</span> {conflict.recommendation}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleAction(conflict.id, 'accept_recommendation')}
                    disabled={actionLoading === conflict.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Accept Recommendation
                  </button>
                  <button 
                    onClick={() => navigate('/planner')}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Reschedule
                  </button>
                  <button 
                    onClick={() => navigate('/what-if')}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Open What-If
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <ChartCard title="Conflicts by Severity" description="Distribution of unresolved conflicts">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                No conflicts data
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
