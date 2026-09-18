import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Wrench, Shield, AlertTriangle, Clock, MapPin, Cpu } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBar from '../components/common/PriorityBar';
import { fetchTask, calculatePriority } from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [priorityDetail, setPriorityDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTask(id),
      calculatePriority(id).catch(() => null),
    ]).then(([taskData, priData]) => {
      setTask(taskData);
      setPriorityDetail(priData);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading task details..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!task) return <ErrorState message="Task not found" />;

  const asset = task.asset_info || {};
  const breakdown = priorityDetail?.breakdown || task.priority_breakdown || {};
  const rawScores = priorityDetail?.raw_scores || {
    criticality: task.criticality,
    urgency: task.urgency,
    overdue_score: task.overdue_score,
    asset_impact: task.asset_impact,
    safety_relevance: task.safety_relevance,
  };
  const explanation = priorityDetail?.explanation || task.explanation || [];

  const InfoRow = ({ label, value, mono }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tasks')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{task.name}</h1>
          <p className="text-slate-500 font-mono">{task.id}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={task.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" /> Task Information
          </h3>
          <InfoRow label="Task ID" value={task.id} mono />
          <InfoRow label="Name" value={task.name} />
          <InfoRow label="Department" value={task.department_name || task.department_id} />
          <InfoRow label="Status" value={<StatusBadge status={task.status} />} />
          <InfoRow label="Planning Date" value={task.planning_date} />
          <InfoRow label="Duration" value={`${task.required_duration_minutes} minutes`} />
          <InfoRow label="Preferred Window" value={`${task.preferred_window_start}:00 – ${task.preferred_window_end}:00`} />
          {task.compatibility_group && <InfoRow label="Compatibility Group" value={task.compatibility_group} />}
          {task.dependencies?.length > 0 && <InfoRow label="Dependencies" value={task.dependencies.join(', ')} />}
        </div>

        {/* Asset Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" /> Asset Information
          </h3>
          <InfoRow label="Asset ID" value={asset.id} mono />
          <InfoRow label="Asset Name" value={asset.name} />
          <InfoRow label="Type" value={asset.type} />
          <InfoRow label="Section" value={task.section} />
          <InfoRow label="Condition" value={asset.condition && <StatusBadge status={asset.condition?.toLowerCase()} label={asset.condition} />} />
          <InfoRow label="Criticality" value={asset.criticality ? `${asset.criticality}/100` : 'N/A'} />
          <InfoRow label="Last Maintenance" value={asset.last_maintenance} />
          <InfoRow label="Next Maintenance" value={asset.next_maintenance} />
        </div>

        {/* Priority Score Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" /> Priority Score Breakdown
          </h3>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold text-blue-600">{task.priority_score?.toFixed(1)}</div>
            <div className="text-sm text-slate-500">out of 100</div>
          </div>

          <PriorityBar score={task.priority_score} breakdown={breakdown} />

          {/* ML Risk Card */}
          {priorityDetail?.ml_risk && (
            <div className="mt-5 p-4 rounded-xl border bg-slate-50 border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  🤖 ML Asset Failure Risk Probability
                </h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  priorityDetail.ml_risk.risk_level === 'CRITICAL' ? 'text-red-700 bg-red-50 border-red-200' :
                  priorityDetail.ml_risk.risk_level === 'HIGH' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                  priorityDetail.ml_risk.risk_level === 'MODERATE' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                  'text-green-700 bg-green-50 border-green-200'
                }`}>
                  {priorityDetail.ml_risk.risk_level} Risk
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 mb-2">
                {priorityDetail.ml_risk.failure_risk_score?.toFixed(1)}
                <span className="text-sm font-normal text-slate-500 ml-1">/ 100</span>
              </p>
              <p className="text-xs text-slate-500 italic">
                Predicted by {priorityDetail.ml_risk.model_type}
              </p>
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">Factor</th>
                  <th className="text-center py-2 text-slate-500 font-medium">Raw Score</th>
                  <th className="text-center py-2 text-slate-500 font-medium">Weight</th>
                  <th className="text-center py-2 text-slate-500 font-medium">Contribution</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'criticality', label: 'Criticality', weight: '30%' },
                  { key: 'urgency', label: 'Urgency', weight: '25%' },
                  { key: 'overdue_score', label: 'Overdue', weight: '20%' },
                  { key: 'asset_impact', label: 'Asset Impact', weight: '15%' },
                  { key: 'safety_relevance', label: 'Safety Relevance', weight: '10%' },
                ].map(f => (
                  <tr key={f.key} className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">{f.label}</td>
                    <td className="py-2 text-center text-slate-800 font-medium">{rawScores[f.key] ?? 'N/A'}</td>
                    <td className="py-2 text-center text-slate-600">{f.weight}</td>
                    <td className="py-2 text-center font-semibold text-blue-600">{breakdown[f.key]?.toFixed(1) ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Explanation */}
          {explanation.length > 0 && (
            <div className="mt-5 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2">Why was this task prioritized?</h4>
              <ul className="space-y-1">
                {explanation.map((reason, idx) => (
                  <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Info */}
      {task.schedule_info && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <h3 className="text-base font-bold text-green-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Scheduled Block
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-green-600">Start:</span> <span className="font-medium">{task.schedule_info.start_time}</span></div>
            <div><span className="text-green-600">End:</span> <span className="font-medium">{task.schedule_info.end_time}</span></div>
            <div><span className="text-green-600">Status:</span> <StatusBadge status={task.schedule_info.approval_status} /></div>
            <div><span className="text-green-600">Date:</span> <span className="font-medium">{task.schedule_info.planning_date}</span></div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/planner')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Schedule This Task
        </button>
        <Link to="/priority" className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition-colors">
          View in AI Priority Engine
        </Link>
      </div>
    </div>
  );
}
