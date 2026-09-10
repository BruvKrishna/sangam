import React, { useState, useEffect } from 'react';
import { fetchAssets } from '../api/client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import FilterBar from '../components/common/FilterBar';
import SearchInput from '../components/common/SearchInput';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import { Train, Shield, AlertTriangle } from 'lucide-react';

const CONDITION_COLORS = {
  good: '#10b981',
  fair: '#3b82f6',
  poor: '#f59e0b',
  critical: '#ef4444',
};

export default function Assets() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAssets({
        search: searchTerm,
        asset_type: typeFilter || undefined,
        condition: conditionFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, typeFilter, conditionFilter]);

  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const columns = [
    { key: 'id', label: 'Asset ID', render: (v) => <span className="font-mono font-medium text-slate-900">{v}</span> },
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'section', label: 'Section', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'department_name', label: 'Department' },
    { key: 'condition', label: 'Condition', render: (v) => <StatusBadge status={v} /> },
    { key: 'maintenance_status', label: 'Maintenance Status', render: (v) => <StatusBadge status={v} /> },
  ];

  // Map backend chart structure to recharts
  const conditionChartData = (data?.charts?.by_condition || []).map(item => ({
    name: item.condition || item.name || 'Unknown',
    value: item.count !== undefined ? item.count : item.value || 0,
  }));

  const typeChartData = (data?.charts?.by_type || []).map(item => ({
    name: item.type || item.name || 'Unknown',
    value: item.count !== undefined ? item.count : item.value || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Asset Management & Availability</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">v1.1</span>
          </div>
          <p className="text-slate-500 text-sm">Monitor physical railway assets, maintenance status, and asset conditions</p>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Assets by Condition" description="Health status of monitored railway assets">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={conditionChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {conditionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CONDITION_COLORS[entry.name.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Assets by Category/Type" description="Distribution across track, S&T, and traction equipment">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={typeChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-80">
            <SearchInput placeholder="Search asset ID, name, type..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          {data && (
            <FilterBar
              filters={[
                {
                  label: 'All Types',
                  value: typeFilter,
                  onChange: setTypeFilter,
                  options: (data.filters?.types || []).map(t => ({ value: t, label: t })),
                },
                {
                  label: 'All Conditions',
                  value: conditionFilter,
                  onChange: setConditionFilter,
                  options: (data.filters?.conditions || ['Good', 'Fair', 'Poor', 'Critical']).map(c => ({ value: c, label: c })),
                },
              ]}
            />
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Updating asset registry..." />
        ) : (
          <DataTable
            columns={columns}
            data={data?.assets || []}
            onRowClick={(asset) => setSelectedAsset(asset)}
          />
        )}
      </div>

      <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Asset Technical Record">
        {selectedAsset && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Asset ID</p>
                <p className="font-mono font-bold text-slate-800">{selectedAsset.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Name</p>
                <p className="font-medium text-slate-800">{selectedAsset.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Asset Type</p>
                <p className="font-medium text-slate-800">{selectedAsset.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Section</p>
                <p className="font-mono text-slate-800">{selectedAsset.section}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Condition</p>
                <StatusBadge status={selectedAsset.condition} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Criticality Score</p>
                <p className="font-bold text-blue-600">{selectedAsset.criticality}/100</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Last Maintenance</p>
                <p className="font-medium text-slate-700">{selectedAsset.last_maintenance}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Next Scheduled</p>
                <p className="font-medium text-slate-700">{selectedAsset.next_maintenance}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Description & Location</p>
              <p className="text-slate-600">{selectedAsset.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
