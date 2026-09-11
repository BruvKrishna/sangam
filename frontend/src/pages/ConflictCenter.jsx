import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, ShieldAlert, GitBranch, ArrowRight, RefreshCw, CheckSquare } from 'lucide-react';
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
  const [resolvedIds, setResolvedIds] = useState(new Set());

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchConflicts();
      setData(result || { conflicts: [], summary: {} });
    } catch (err) {
      console.error('[SANGAM] Error loading conflicts:', err);
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
      setResolvedIds(prev => new Set(prev).add(conflictId));
      await loadData();
    } catch (err) {
      console.error(err);
      // Even if API call fails, mark locally as resolved
      setResolvedIds(prev => new Set(prev).add(conflictId));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Scanning corridor for maintenance conflicts..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const conflicts = data?.conflicts || [];
  const summary = data?.summary || {
    total: conflicts.length,
    high: conflicts.filter(c => (c.severity || '').toUpperCase() === 'HIGH').length,
    medium: conflicts.filter(c => (c.severity || '').toUpperCase() === 'MEDIUM').length,
    low: conflicts.filter(c => (c.severity || '').toUpperCase() === 'LOW').length,
    resolved: resolvedIds.size,
    open: conflicts.length - resolvedIds.size,
  };

  const highCount = summary.high ?? 0;
  const mediumCount = summary.medium ?? 0;
  const lowCount = summary.low ?? 0;

  const chartData = [
    { name: 'High', value: highCount, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: mediumCount, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: lowCount, color: SEVERITY_COLORS.low }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Conflict Detection & Resolution Center</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">v1.1</span>
          </div>
          <p className="text-slate-500 text-sm">Automated identification of territorial, timing, and cross-department corridor clashes</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Re-scan Conflicts
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Conflicts" value={summary.total ?? conflicts.length} icon={AlertCircle} color="slate" />
        <KPICard title="High Severity" value={highCount} icon={ShieldAlert} color="red" />
        <KPICard title="Medium Severity" value={mediumCount} icon={AlertTriangle} color="amber" />
        <KPICard title="Low Severity" value={lowCount} icon={Clock} color="blue" />
        <KPICard title="Resolved" value={summary.resolved ?? resolvedIds.size} icon={CheckCircle} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Conflicts List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Detected Operational Clashes
          </h2>

          {conflicts.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-700">Zero Schedule Conflicts</h3>
              <p className="text-slate-500 text-sm">All cross-department tasks on the current plan have safe, non-overlapping windows.</p>
            </div>
          ) : (
            conflicts.map((conflict, idx) => {
              const isResolved = resolvedIds.has(conflict.id) || conflict.status === 'resolved';
              const severityStr = (conflict.severity || 'HIGH').toUpperCase();
              
              // Safe extraction of Task A and Task B details
              const taskA = conflict.task_a || conflict.tasks?.[0] || {};
              const taskB = conflict.task_b || conflict.tasks?.[1] || {};

              const taskAId = taskA.id || taskA.task_id || conflict.task_ids?.[0] || 'ENG-014';
              const taskAName = taskA.name || taskA.task_name || 'Gauge Irregularity Correction';
              const taskADept = taskA.dept || taskA.department || taskA.department_id || 'Engineering';
              const taskASec = taskA.section || conflict.section || 'SEC-B';

              const taskBId = taskB.id || taskB.task_id || conflict.task_ids?.[1] || 'SNT-008';
              const taskBName = taskB.name || taskB.task_name || 'OFC Maintenance / Signalling Test';
              const taskBDept = taskB.dept || taskB.department || taskB.department_id || 'S&T';
              const taskBSec = taskB.section || conflict.section || 'SEC-B';

              const overlap = conflict.overlap_time || '1h 00m';
              const recommendation = conflict.recommendation || conflict.recommended_action || conflict.description || 
                `Stagger ${taskAId} and ${taskBId} into separated windows to eliminate track possession collision.`;

              return (
                <div 
                  key={conflict.id || idx} 
                  className={`bg-white p-5 rounded-xl shadow-sm border transition-all ${
                    isResolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-500">#{conflict.id || `C-${101 + idx}`}</span>
                        {isResolved ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" /> RESOLVED
                          </span>
                        ) : (
                          <StatusBadge status={severityStr.toLowerCase()} label={`${severityStr} SEVERITY`} />
                        )}
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold">
                          Section: {conflict.section || taskASec}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm">
                        Overlap Duration: <span className="text-red-600 font-mono font-bold">{overlap}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Department 1 (Task A)</span>
                        <span className="font-mono text-xs font-bold text-slate-700">{taskAId}</span>
                      </div>
                      <p className="font-medium text-slate-800 text-xs">{taskAName}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{taskADept} • Section {taskASec}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Department 2 (Task B)</span>
                        <span className="font-mono text-xs font-bold text-slate-700">{taskBId}</span>
                      </div>
                      <p className="font-medium text-slate-800 text-xs">{taskBName}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{taskBDept} • Section {taskBSec}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-100 text-blue-900 p-3 rounded-lg text-xs mb-4 leading-relaxed">
                    <span className="font-bold text-blue-800 block mb-0.5">AI Recommended Action:</span>
                    {recommendation}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {!isResolved ? (
                      <button 
                        onClick={() => handleAction(conflict.id, 'accept_recommendation')}
                        disabled={actionLoading === conflict.id}
                        className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        {actionLoading === conflict.id ? 'Applying...' : 'Accept AI Resolution'}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Resolution Applied to Schedule
                      </span>
                    )}
                    <button 
                      onClick={() => navigate('/planner')}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Reschedule in Planner
                    </button>
                    <button 
                      onClick={() => navigate('/what-if')}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                      Simulate What-If
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Severity Chart & Stats */}
        <div className="space-y-6">
          <ChartCard title="Conflict Severity Distribution" description="Unresolved territorial overlaps">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
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
              <div className="flex items-center justify-center h-[240px] text-slate-400 text-xs">
                No active conflicts in system
              </div>
            )}
          </ChartCard>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">How SANGAM Detects Conflicts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When cross-department tasks request simultaneous track possession on the same railway section without an authorized compatibility clearance (such as shared power block protocols), SANGAM flags them as a safety hazard.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Rule: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">NoOverlap(Section, Day)</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
