import React, { useState } from 'react';
import { runWhatIf } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { GitBranch, Play, CheckCircle2, RotateCcw } from 'lucide-react';

export default function WhatIfAnalysis() {
  const [scenarioType, setScenarioType] = useState('extend_block');
  const [scenarioParams, setScenarioParams] = useState({ taskId: 'ENG-014', duration: '90', date: '2026-09-10' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await runWhatIf({
        type: scenarioType,
        params: scenarioParams,
        planning_date: scenarioParams.date || '2026-09-10',
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to run what-if scenario');
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (current, next, inverse = false) => {
    if (current === next) return 'text-slate-600';
    const isBetter = inverse ? next < current : next > current;
    return isBetter ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold';
  };

  const chartData = result ? [
    { name: 'Block Hours', Baseline: result.comparison.total_block_hours.current, Scenario: result.comparison.total_block_hours.new },
    { name: 'Tasks Scheduled', Baseline: result.comparison.tasks_scheduled.current, Scenario: result.comparison.tasks_scheduled.new },
    { name: 'Tasks Delayed', Baseline: result.comparison.tasks_delayed.current, Scenario: result.comparison.tasks_delayed.new },
    { name: 'Conflicts', Baseline: result.comparison.conflicts.current, Scenario: result.comparison.conflicts.new },
    { name: 'Critical Completed', Baseline: result.comparison.critical_tasks_completed.current, Scenario: result.comparison.critical_tasks_completed.new },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">What-If Scenario Analysis</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">v1.1</span>
          </div>
          <p className="text-slate-500 text-sm">Simulate operational schedule changes and evaluate impact against baseline plan</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          Configure Scenario Parameters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Scenario Type</label>
            <select
              value={scenarioType}
              onChange={e => setScenarioType(e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="extend_block">Extend Block Window</option>
              <option value="remove_task">Remove Maintenance Task</option>
              <option value="add_urgent_task">Add Urgent Maintenance Task</option>
              <option value="close_window">Close Section Window</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target Task ID / Asset</label>
            <input
              type="text"
              value={scenarioParams.taskId}
              onChange={e => setScenarioParams({ ...scenarioParams, taskId: e.target.value })}
              className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="e.g. ENG-014"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Duration / Value</label>
            <input
              type="text"
              value={scenarioParams.duration}
              onChange={e => setScenarioParams({ ...scenarioParams, duration: e.target.value })}
              className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 90 mins"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Play className="w-4 h-4" />}
              {loading ? 'Simulating...' : 'Run Scenario'}
            </button>
            {result && (
              <button
                onClick={() => setResult(null)}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
                title="Reset scenario"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={handleRun} />}

      {loading && <LoadingSpinner message="Re-running CP-SAT engine for what-if scenario..." />}

      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Scenario Impact Summary
              </h2>
              <div className="space-y-3">
                {Object.entries(result.comparison).map(([key, data]) => (
                  <div key={key} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm font-medium text-slate-600 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-slate-400 font-mono">Baseline: {data.current}</span>
                      <span className={`text-sm font-mono ${getMetricColor(data.current, data.new, key.includes('delay') || key.includes('conflict'))}`}>
                        New: {data.new}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => alert('Scenario applied to active planning session!')}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Apply Scenario
              </button>
              <button
                onClick={() => setResult(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>

          <ChartCard title="Metric Comparison (Baseline vs Scenario)" description="Impact across operational KPIs">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Scenario" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {!result && !loading && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Select a scenario type and parameters above, then click <strong>Run Scenario</strong> to test operational changes against the current block plan.
        </div>
      )}
    </div>
  );
}
