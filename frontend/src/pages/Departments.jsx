import React, { useState, useEffect } from 'react';
import { fetchDepartments } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { Building2, Users, Layers, Zap } from 'lucide-react';

export default function Departments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDepartments();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load departments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading departments overview..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!data) return null;

  const departments = data.departments || [];
  const opportunities = data.coordination_opportunities || [];

  const chartData = departments.map(d => ({
    name: d.name,
    Active: d.stats?.active || 0,
    Planned: d.stats?.planned || 0,
    Pending: d.stats?.pending || 0,
    Overdue: d.stats?.overdue || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Departments Overview</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">v1.1</span>
          </div>
          <p className="text-slate-500 text-sm">Departmental maintenance workload, block utilization, and multi-department coordination</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {dept.name}
                </h2>
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{dept.id}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{dept.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">Total Tasks</span>
                  <span className="font-bold text-slate-800 text-base">{dept.stats?.total_tasks || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">Block Hours</span>
                  <span className="font-bold text-blue-600 text-base">{dept.stats?.block_hours || 0}h</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">Overdue</span>
                  <span className="font-bold text-red-600 text-base">{dept.stats?.overdue || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold text-[10px]">Utilization</span>
                  <span className="font-bold text-emerald-600 text-base">{dept.stats?.resource_utilization || 0}%</span>
                </div>
              </div>
              {dept.head && (
                <p className="text-slate-500 pt-1">
                  <span className="font-medium text-slate-700">Head:</span> {dept.head}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Workload Distribution" description="Active, planned, pending, and overdue tasks by department">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
              <Legend />
              <Bar dataKey="Active" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Planned" stackId="a" fill="#10b981" />
              <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Overdue" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Multi-Department Coordination Opportunities
          </h2>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px]">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-amber-900 text-sm">{opp.title || opp.recommendation}</h3>
                  {opp.potential_savings && (
                    <span className="text-xs bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-bold">
                      Saved: {opp.potential_savings}h
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-800">{opp.description || opp.recommendation}</p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                    Section: {opp.section}
                  </span>
                  {opp.departments && (
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                      Depts: {Array.isArray(opp.departments) ? opp.departments.join(', ') : opp.departments}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {opportunities.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">No immediate coordination opportunities detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
