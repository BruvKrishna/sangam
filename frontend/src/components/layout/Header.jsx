import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

const routeNames = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Maintenance Tasks',
  '/planner': 'Block Planner',
  '/timeline': 'Schedule & Timeline',
  '/conflicts': 'Conflict Center',
  '/what-if': 'What-If Analysis',
  '/departments': 'Departments Overview',
  '/assets': 'Asset Management',
  '/data-sources': 'Data Sources Integration',
  '/ai-priority': 'AI Priority Engine',
  '/optimization': 'Optimization Engine',
  '/review': 'Review & Approval',
  '/reports': 'Reports & Analytics',
  '/about': 'System About',
};

export default function Header() {
  const location = useLocation();
  const title = routeNames[location.pathname] || (location.pathname.startsWith('/tasks/') ? 'Task Details' : 'SANGAM');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="bg-amber-100 text-amber-900 text-xs font-semibold py-1.5 px-4 text-center tracking-wider flex justify-center items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span>DEMO MODE — SYNTHETIC DATA</span>
        <span className="bg-amber-200/80 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">v1.1</span>
      </div>
      <div className="px-8 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <span>Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
          <div className="h-4 w-px bg-slate-300 mx-2"></div>
          <span className="font-medium text-slate-700">Railway Section Controller</span>
        </div>
      </div>
    </header>
  );
}
