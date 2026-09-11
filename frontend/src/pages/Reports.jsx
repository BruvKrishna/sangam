import React, { useState, useEffect } from 'react';
import { fetchReportTypes, generateReport } from '../api/client';
import { FileText, Download, Printer, Calendar, CheckCircle2, AlertTriangle, Cpu, Shield, Clock } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export default function Reports() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('2026-09-10');
  const [reportResult, setReportResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoading(true);
        const data = await fetchReportTypes();
        setTypes(data);
      } catch (err) {
        setError(err.message || 'Failed to load report types');
      } finally {
        setLoading(false);
      }
    };
    loadTypes();
  }, []);

  const handleGenerate = async (typeId) => {
    try {
      setGenerating(true);
      setReportResult(null);
      const result = await generateReport(typeId, selectedDate);
      setReportResult(result);
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Loading report registry..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const content = reportResult?.content || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Reports & Operational Analytics</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">v1.1</span>
          </div>
          <p className="text-slate-500 text-sm">Generate standardized Indian Railways divisional block plans, audits, and asset reports</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-500 uppercase">Target Date:</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-mono font-medium text-slate-700 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map(type => (
          <div key={type.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800 text-base">{type.name}</h2>
              </div>
              <p className="text-xs text-slate-600 mb-5 line-clamp-2 leading-relaxed">{type.description}</p>
            </div>
            <button 
              onClick={() => handleGenerate(type.id)}
              disabled={generating}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              Generate Report →
            </button>
          </div>
        ))}
      </div>

      {generating && (
        <div className="mt-8 p-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <LoadingSpinner message="Aggregating divisional data and generating report..." />
        </div>
      )}

      {reportResult && !generating && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-slate-50 print:hidden">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Report Ready: {reportResult.report_type.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button onClick={handlePrint} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Box */}
              <div className="text-center border-b border-slate-200 pb-6">
                <div className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  Indian Railways — Divisional Block Planning Authority
                </div>
                <h1 className="text-2xl font-black text-slate-800">{content.title || 'Operational Block Report'}</h1>
                <p className="text-slate-500 text-sm mt-1">{content.summary}</p>
                <div className="flex justify-center items-center gap-4 text-xs text-slate-400 mt-3 font-mono">
                  <span>Target Date: {reportResult.planning_date}</span>
                  <span>•</span>
                  <span>Generated: {new Date(reportResult.generated_at).toLocaleString()}</span>
                  <span>•</span>
                  <span>System: SANGAM v1.1</span>
                </div>
              </div>

              {/* Schedules Table if present */}
              {content.schedules && content.schedules.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Sanctioned Block Schedule</h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2.5 px-3 text-left font-bold">Task ID</th>
                          <th className="py-2.5 px-3 text-left font-bold">Maintenance Activity</th>
                          <th className="py-2.5 px-3 text-left font-bold">Department</th>
                          <th className="py-2.5 px-3 text-left font-bold">Section</th>
                          <th className="py-2.5 px-3 text-center font-bold">Block Window</th>
                          <th className="py-2.5 px-3 text-center font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {content.schedules.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.task_id}</td>
                            <td className="py-2.5 px-3 text-slate-800 font-medium">{s.task_name || s.name}</td>
                            <td className="py-2.5 px-3 text-slate-600">{s.department || s.department_name || s.department_id}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{s.section}</td>
                            <td className="py-2.5 px-3 font-mono text-center font-semibold text-blue-600">
                              {s.window || `${s.start_time} - ${s.end_time}`}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold">
                                {s.status || 'Sanctioned'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Critical Alerts / Overdue Tasks if present */}
              {content.critical_alerts && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Critical Overdue Maintenance Work Orders
                  </h3>
                  <div className="overflow-x-auto border border-red-200 rounded-xl">
                    <table className="w-full text-xs">
                      <thead className="bg-red-50/50 border-b border-red-200 text-red-900">
                        <tr>
                          <th className="py-2.5 px-3 text-left font-bold">Task ID</th>
                          <th className="py-2.5 px-3 text-left font-bold">Activity Name</th>
                          <th className="py-2.5 px-3 text-left font-bold">Section</th>
                          <th className="py-2.5 px-3 text-center font-bold">Overdue Days</th>
                          <th className="py-2.5 px-3 text-center font-bold">AI Priority Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {content.critical_alerts.map((a, idx) => (
                          <tr key={idx} className="hover:bg-red-50/30">
                            <td className="py-2.5 px-3 font-mono font-bold text-red-800">{a.task_id}</td>
                            <td className="py-2.5 px-3 text-slate-800 font-medium">{a.name}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{a.section}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-red-600">+{a.overdue_days} days</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">{a.priority} / 100</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Department Breakdown if present */}
              {content.departments && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Departmental Allocation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(content.departments).map(([dept, dStats]) => (
                      <div key={dept} className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <span className="font-bold text-slate-800 text-xs block">{dept}</span>
                        <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                          <div>Planned: <strong className="text-slate-900">{dStats.tasks_planned}</strong></div>
                          <div>Hours: <strong className="text-blue-600">{dStats.total_hours}</strong></div>
                          <div>Critical: <strong className="text-red-600">{dStats.critical_work}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflict Resolutions if present */}
              {content.resolved_conflicts && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Resolved Clashes</h3>
                  <div className="space-y-2">
                    {content.resolved_conflicts.map((c, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-slate-800">{c.id}</span> • Section <span className="font-mono font-semibold">{c.section}</span> ({c.departments})
                          <p className="text-slate-500 mt-0.5">{c.resolution}</p>
                        </div>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Resolved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solver stats if present */}
              {content.solver_stats && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-blue-900">Google OR-Tools CP-SAT Solver Execution Verification</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
                    <div>Status: <strong className="text-emerald-700">{content.solver_stats.status}</strong></div>
                    <div>Solve Time: <strong>{content.solver_stats.solve_time_seconds}s</strong></div>
                    <div>Constraints: <strong>{content.solver_stats.constraints_evaluated}</strong></div>
                    <div>Objective Score: <strong>{content.solver_stats.objective_score}</strong></div>
                  </div>
                </div>
              )}

              {/* Sign-off footer */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Section Controller (SANGAM AI Certified)</p>
                  <p className="mt-8 border-t border-slate-300 w-48 pt-1">Authorized Signature</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">Sr. Divisional Operations Manager (DOM)</p>
                  <p className="mt-8 border-t border-slate-300 w-48 ml-auto pt-1">Countersigned</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
