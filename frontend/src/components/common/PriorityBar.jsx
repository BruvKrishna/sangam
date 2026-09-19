export default function PriorityBar({ score, breakdown }) {
  // breakdown = { criticality: 30, urgency: 25, impact: 20, dependencies: 10 }
  const total = score || 100;
  
  const colors = {
    criticality: 'bg-red-500',
    urgency: 'bg-amber-500',
    overdue_score: 'bg-orange-400',
    asset_impact: 'bg-blue-500',
    safety_relevance: 'bg-green-500',
    impact: 'bg-blue-500',
    dependencies: 'bg-purple-500',
    other: 'bg-slate-300'
  };

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-red-600';
    if (s >= 60) return 'text-amber-600';
    if (s >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium text-slate-700">Priority Score Breakdown</span>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
      
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
        {breakdown && Object.entries(breakdown).map(([key, val]) => (
          <div 
            key={key}
            style={{ width: `${(val / total) * 100}%` }}
            className={`h-full ${colors[key] || colors.other}`}
            title={`${key}: ${val}`}
          />
        ))}
      </div>
      
      <div className="flex gap-4 mt-3 flex-wrap">
        {breakdown && Object.entries(breakdown).map(([key, val]) => (
          <div key={key} className="flex items-center text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full mr-1.5 ${colors[key] || colors.other}`}></span>
            <span className="capitalize">{key}: {val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
