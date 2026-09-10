import React, { useState, useEffect } from 'react';
import { fetchPriorityFormula, fetchTasks, calculatePriority } from '../api/client';
import PriorityBar from '../components/common/PriorityBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export default function AIPriorityEngine() {
  const [formulaData, setFormulaData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [priorityData, setPriorityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fData, tData] = await Promise.all([
        fetchPriorityFormula(),
        fetchTasks()
      ]);
      setFormulaData(fData);
      setTasks(tData.tasks);
      if (tData.tasks.length > 0) {
        setSelectedTaskId(tData.tasks[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load priority engine data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      handleCalculate(selectedTaskId);
    }
  }, [selectedTaskId]);

  const handleCalculate = async (taskId) => {
    try {
      setCalcLoading(true);
      const data = await calculatePriority(taskId);
      setPriorityData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCalcLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Priority Engine..." />;
  if (error) return <ErrorState message={error} onRetry={loadInitialData} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">AI Priority Engine</h1>
        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
          PROTOTYPE ALGORITHM
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Task Evaluation</h2>
              <select 
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="rounded-lg border-slate-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500 max-w-xs w-full"
              >
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.id} - {t.name}</option>
                ))}
              </select>
            </div>

            {calcLoading ? (
              <div className="py-12"><LoadingSpinner message="Calculating priority score..." /></div>
            ) : priorityData ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{priorityData.task_name}</h3>
                    <p className="text-sm text-slate-500">ID: {priorityData.task_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-500 uppercase">Total Score</p>
                    <p className="text-4xl font-black text-blue-600">{priorityData.score.toFixed(1)}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Score Breakdown</h4>
                  <PriorityBar breakdown={priorityData.breakdown} />
                </div>

                <table className="w-full text-sm text-left text-slate-600 mb-8 border-collapse">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Factor</th>
                      <th className="px-4 py-3 font-semibold text-right">Raw Value</th>
                      <th className="px-4 py-3 font-semibold text-right">Weight</th>
                      <th className="px-4 py-3 font-semibold text-right">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(priorityData.breakdown).map(([factor, contrib], idx) => (
                      <tr key={factor} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 capitalize font-medium text-slate-800">{factor.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-right">{priorityData.raw_scores[factor]}</td>
                        <td className="px-4 py-3 text-right">x {(priorityData.weights[factor] * 10).toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">+{contrib.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Why was this task prioritized?</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {priorityData.explanation.map((exp, idx) => (
                      <li key={idx}>{exp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Formula Weights</h2>
            <div className="space-y-4">
              {formulaData.weights.map((w, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{w.factor}</span>
                    <span className="text-slate-500">{(w.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${w.weight * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{w.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 italic">
                {formulaData.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
