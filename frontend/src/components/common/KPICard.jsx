import { clsx } from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={clsx("p-2 rounded-lg border", selectedColor)}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend.direction === 'up' && <ArrowUpRight className={clsx("w-4 h-4 mr-1", trend.positive ? "text-green-500" : "text-red-500")} />}
          {trend.direction === 'down' && <ArrowDownRight className={clsx("w-4 h-4 mr-1", trend.positive ? "text-green-500" : "text-red-500")} />}
          {trend.direction === 'neutral' && <Minus className="w-4 h-4 mr-1 text-slate-400" />}
          <span className={clsx("font-medium mr-2", 
            trend.direction === 'neutral' ? "text-slate-500" :
            trend.positive ? "text-green-600" : "text-red-600"
          )}>
            {trend.value}
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
