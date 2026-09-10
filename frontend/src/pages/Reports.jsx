import React, { useState, useEffect } from 'react';
import { fetchReportTypes, generateReport } from '../api/client';
import { FileText, Download, Printer, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export default function Reports() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  if (loading) return <LoadingSpinner message="Loading report types..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-500" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm text-slate-700 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map(type => (
          <div key={type.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-slate-800">{type.name}</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6 flex-grow">{type.description}</p>
            <button 
              onClick={() => handleGenerate(type.id)}
              disabled={generating}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Generate Report
            </button>
          </div>
        ))}
      </div>

      {generating && (
        <div className="mt-8 p-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <LoadingSpinner message="Generating report data..." />
        </div>
      )}

      {reportResult && !generating && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-800">Report Preview: {reportResult.report_type.replace(/_/g, ' ').toUpperCase()}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>
          
          <div className="p-8 print:p-0">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-800">SANGAM System Report</h1>
                <p className="text-slate-500">Type: {reportResult.report_type}</p>
                <p className="text-slate-500">Planning Date: {reportResult.planning_date}</p>
                <p className="text-xs text-slate-400 mt-2">Generated: {reportResult.generated_at}</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {JSON.stringify(reportResult.content, null, 2)}
                  </pre>
                </div>
                <div className="text-center text-sm text-slate-500 italic mt-8">
                  End of Report Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
