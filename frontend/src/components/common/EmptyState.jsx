import { FolderOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = FolderOpen, title = 'No Data Found', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center w-full h-full min-h-[300px]">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      {message && <p className="text-slate-500 mb-6 text-sm max-w-sm">{message}</p>}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
