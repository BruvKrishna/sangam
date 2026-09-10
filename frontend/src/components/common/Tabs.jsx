import { clsx } from 'clsx';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2'
              )}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx(
                  "ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium",
                  isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
