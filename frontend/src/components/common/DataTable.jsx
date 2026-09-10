import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, sortable = true, pagination = true }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);
  
  const itemsPerPage = 15;

  const handleSort = (key) => {
    if (!sortable) return;
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    // Safely get nested properties if needed (though simple dot notation assumed)
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = pagination 
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={`px-6 py-4 ${sortable && col.sortable !== false ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                  onClick={() => (sortable && col.sortable !== false) ? handleSort(col.key) : null}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortable && col.sortable !== false && (
                      <span className="text-slate-400">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.length > 0 ? (
              currentData.map((row, i) => (
                <tr 
                  key={row.id || i} 
                  className={`group ${onRowClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && totalPages > 1 && (
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-auto">
          <span className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-medium text-slate-700">{sortedData.length}</span> results
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
