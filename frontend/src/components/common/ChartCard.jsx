import { Info } from 'lucide-react';

export default function ChartCard({ title, children, description }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        {description && (
          <button className="text-slate-400 hover:text-slate-600" title={description}>
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        {children}
      </div>
    </div>
  );
}
