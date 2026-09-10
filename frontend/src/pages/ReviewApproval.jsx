import React, { useState, useEffect } from 'react';
import { fetchAllApprovals, submitApproval } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import KPICard from '../components/common/KPICard';
import { FileSignature, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

export default function ReviewApproval() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAllApprovals();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (scheduleId, action) => {
    try {
      setActionLoading(scheduleId);
      await submitApproval(scheduleId, action, 'Current User', 'Action from ReviewApproval UI');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to submit approval: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading review and approvals..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  
  const { entries, summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Review & Approval</h1>
        <button onClick={loadData} className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-sm font-medium">
          Refresh List
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center gap-4 text-sm font-medium text-slate-600 mb-6">
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</span> Optimization Run</div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center gap-2 text-blue-600"><span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">2</span> Section Review</div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">3</span> Final Approval</div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">4</span> Execution</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Entries" value={summary.total} icon={FileSignature} color="slate" />
        <KPICard title="Pending Review" value={summary.pending} icon={Clock} color="amber" />
        <KPICard title="Approved" value={summary.approved} icon={CheckCircle} color="emerald" />
        <KPICard title="Rejected" value={summary.rejected} icon={XCircle} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Schedule Review Queue</h2>
        </div>
        
        {entries.length === 0 ? (
          <div className="p-6">
            <EmptyState message="No schedules pending review." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Task & Location</th>
                  <th className="px-4 py-3 font-semibold">Timing</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">{entry.task_id}</p>
                      <p className="text-xs text-slate-500">{entry.department} • {entry.location}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">{entry.start_time} - {entry.end_time}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">P{entry.priority}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      {entry.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleAction(entry.id, 'approve')}
                            disabled={actionLoading === entry.id}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium hover:bg-emerald-100 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(entry.id, 'reject')}
                            disabled={actionLoading === entry.id}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleAction(entry.id, 'modify')}
                            disabled={actionLoading === entry.id}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium hover:bg-amber-100 disabled:opacity-50"
                          >
                            Modify
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Action taken</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
