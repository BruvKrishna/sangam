import { Filter } from 'lucide-react';

export default function FilterBar({ filters }) {
  return (
    <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex-wrap">
      <div className="flex items-center text-slate-500 pl-2">
        <Filter className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
