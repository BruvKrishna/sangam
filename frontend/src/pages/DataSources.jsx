import React, { useState, useEffect } from 'react';
import { fetchDataSources } from '../api/client';
import { Database, Server, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import StatusBadge from '../components/common/StatusBadge';

export default function DataSources() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDataSources();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load data sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading data sources..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const { sources, pipeline, note } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Data Sources & Integration</h1>
        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
          PROTOTYPE / SYNTHETIC DATA
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">{note}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Data Pipeline Architecture</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8 overflow-x-auto">
          {pipeline.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-lg p-4 w-48 text-center shadow-sm">
                <Server className="w-6 h-6 text-slate-600 mb-2" />
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{step.name}</h3>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
              {idx < pipeline.length - 1 && (
                <ArrowRight className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0 my-2 md:my-0 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Connected Systems</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map(source => (
          <div key={source.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-800">{source.name}</h3>
              </div>
              <StatusBadge status={source.sync_status === 'success' ? 'active' : 'error'} label={source.sync_status} />
            </div>
            
            <p className="text-sm text-slate-600 mb-4">{source.description}</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Data Types</p>
                <div className="flex flex-wrap gap-2">
                  {source.data_types.map(dt => (
                    <span key={dt} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{dt}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <RefreshCw className="w-3 h-3" />
                  <span>Records: {source.records.toLocaleString()}</span>
                </div>
                {source.sync_status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
