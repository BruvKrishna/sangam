import React, { useState, useEffect } from 'react';
import { fetchPriorityFormula, fetchTasks, calculatePriority } from '../api/client';
import PriorityBar from '../components/common/PriorityBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

const DEFAULT_WEIGHTS = {
  criticality: 0.30,
  urgency: 0.25,
  overdue_score: 0.20,
  asset_impact: 0.15,
  safety_relevance: 0.10,
};

const PRESETS = {
  Default: { ...DEFAULT_WEIGHTS },
  'Monsoon Mode': { criticality: 0.20, urgency: 0.20, overdue_score: 0.15, asset_impact: 0.15, safety_relevance: 0.30 },
  'High-Speed Corridor': { criticality: 0.35, urgency: 0.30, overdue_score: 0.15, asset_impact: 0.15, safety_relevance: 0.05 },
  'Safety Focus': { criticality: 0.20, urgency: 0.15, overdue_score: 0.10, asset_impact: 0.10, safety_relevance: 0.45 },
};

const FACTOR_LABELS = {
  criticality: 'Criticality',
  urgency: 'Urgency',
  overdue_score: 'Overdue',
  asset_impact: 'Asset Impact',
  safety_relevance: 'Safety Relevance',
};

const RISK_COLORS = {
  Low: 'text-green-700 bg-green-50 border-green-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  High: 'text-orange-700 bg-orange-50 border-orange-200',
  Critical: 'text-red-700 bg-red-50 border-red-200',
  LOW: 'text-green-700 bg-green-50 border-green-200',
  MODERATE: 'text-amber-700 bg-amber-50 border-amber-200',
  HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-700 bg-red-50 border-red-200',
};

export default function AIPriorityEngine() {
  const [formulaData, setFormulaData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [priorityData, setPriorityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [activePreset, setActivePreset] = useState('Default');

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
      handleCalculate(selectedTaskId, weights);
    }
  }, [selectedTaskId]);

  const handleCalculate = async (taskId, customWeights) => {
    try {
      setCalcLoading(true);
      const data = await calculatePriority(taskId, customWeights);
      setPriorityData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleWeightChange = (factor, value) => {
    setWeights(prev => ({ ...prev, [factor]: parseFloat(value) }));
    setActivePreset('Custom');
  };

  const applyPreset = (presetName) => {
    setWeights({ ...PRESETS[presetName] });
    setActivePreset(presetName);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightsValid = Math.abs(totalWeight - 1.0) < 0.01;

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
        {/* ── Left: Task Evaluation ── */}
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
                  <PriorityBar score={priorityData.score} breakdown={priorityData.breakdown} />
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
                    {Object.entries(priorityData.breakdown).map(([factor, contrib]) => (
                      <tr key={factor} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 capitalize font-medium text-slate-800">{factor.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-right">{priorityData.raw_scores[factor]}</td>
                        <td className="px-4 py-3 text-right">× {(priorityData.weights[factor] * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">+{contrib.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ML Risk Card */}
                {priorityData.ml_risk && (
                  <div className={`p-4 rounded-xl border mb-6 ${RISK_COLORS[priorityData.ml_risk.risk_level] || 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold">🤖 ML Failure Risk Prediction</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${RISK_COLORS[priorityData.ml_risk.risk_level] || ''}`}>
                        {priorityData.ml_risk.risk_level} Risk
                      </span>
                    </div>
                    <p className="text-2xl font-black mb-3">
                      {priorityData.ml_risk.failure_risk_score.toFixed(1)}
                      <span className="text-sm font-normal ml-1 opacity-70">/ 100</span>
                    </p>
                    {priorityData.ml_risk.feature_importance && (
                      <div>
                        <p className="text-xs font-semibold uppercase opacity-70 mb-2">Feature Importance</p>
                        <div className="space-y-1.5">
                          {Object.entries(priorityData.ml_risk.feature_importance)
                            .sort(([, a], [, b]) => b - a)
                            .map(([feat, imp]) => {
                              const val = typeof imp === 'number' ? imp : parseFloat(imp) || 0;
                              return (
                                <div key={feat} className="flex items-center gap-2 text-xs">
                                  <span className="w-28 capitalize opacity-80 shrink-0">{feat.replace(/_/g, ' ')}</span>
                                  <div className="flex-1 bg-white bg-opacity-60 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-1.5 rounded-full bg-current opacity-70 transition-all duration-300"
                                      style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                                    />
                                  </div>
                                  <span className="w-12 text-right opacity-80 font-mono shrink-0">{val.toFixed(1)}%</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                    <p className="text-xs opacity-50 mt-3 italic">Model: {priorityData.ml_risk.model_type}</p>
                  </div>
                )}

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

        {/* ── Right: Weight Controls + Formula ── */}
        <div className="space-y-6">
          {/* Weight Sliders */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Scoring Weights</h2>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {Object.keys(PRESETS).map(preset => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`text-xs px-2 py-1 rounded-md border font-medium transition-colors ${
                    activePreset === preset
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {Object.entries(weights).map(([factor, val]) => (
                <div key={factor}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{FACTOR_LABELS[factor]}</span>
                    <span className="text-slate-500">{(val * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.70"
                    step="0.01"
                    value={val}
                    onChange={(e) => handleWeightChange(factor, e.target.value)}
                    className="w-full accent-blue-600"
                  />
                </div>
              ))}
            </div>

            {/* Total weight indicator */}
            <div className={`mt-4 text-xs p-2 rounded-lg text-center font-semibold ${
              weightsValid
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              Total: {(totalWeight * 100).toFixed(0)}% {weightsValid ? '✓' : '— must equal 100%'}
            </div>

            <button
              onClick={() => handleCalculate(selectedTaskId, weights)}
              disabled={!weightsValid || calcLoading || !selectedTaskId}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              {calcLoading ? 'Calculating...' : 'Recalculate with These Weights'}
            </button>
          </div>

          {/* Formula Reference */}
          {formulaData && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Formula Reference</h2>
              <div className="space-y-3">
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
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 italic">{formulaData.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
