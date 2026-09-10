import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-red-100 max-w-md mx-auto text-center shadow-sm">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      {message && <p className="text-slate-500 mb-6 text-sm">{message}</p>}
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-sm transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
