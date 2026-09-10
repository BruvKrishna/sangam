import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Wrench, Calendar, Clock, AlertTriangle, 
  GitBranch, Building2, Train, Database, Brain, Cpu, 
  CheckSquare, FileText, Settings 
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Maintenance Tasks', icon: Wrench },
  { path: '/planner', label: 'Block Planner', icon: Calendar },
  { path: '/timeline', label: 'Schedule / Timeline', icon: Clock },
  { path: '/conflicts', label: 'Conflict Center', icon: AlertTriangle },
  { path: '/what-if', label: 'What-If Analysis', icon: GitBranch },
  { path: '/departments', label: 'Departments', icon: Building2 },
  { path: '/assets', label: 'Assets', icon: Train },
  { path: '/data-sources', label: 'Data Sources', icon: Database },
  { path: '/ai-priority', label: 'AI Priority Engine', icon: Brain },
  { path: '/optimization', label: 'Optimization Engine', icon: Cpu },
  { path: '/review', label: 'Review & Approval', icon: CheckSquare },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/about', label: 'System / About', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Train className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="font-bold text-xl tracking-tight">SANGAM</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Block Planning</p>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
