import { useState } from 'react';

/**
 * GanttChart - Visualizes scheduled maintenance blocks on a time axis.
 * Props:
 *   data: Array of { id, name, department, departmentName, section, startTime, endTime, priority, color, compatibilityGroup, assetId }
 *   onTaskClick: (task) => void
 *   startHour: number (default 6)
 *   endHour: number (default 22)
 */
export default function GanttChart({ data = [], onTaskClick, startHour = 6, endHour = 22 }) {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const totalSlots = (endHour - startHour) * 4; // 15-min slots
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);

  // Parse "HH:MM" to slot index
  const timeToSlot = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h - startHour) * 4 + Math.floor(m / 15);
  };

  // Group tasks by department
  const deptGroups = {};
  data.forEach(task => {
    const key = task.department || 'Unknown';
    if (!deptGroups[key]) {
      deptGroups[key] = {
        name: task.departmentName || key,
        color: task.color || '#6b7280',
        tasks: [],
      };
    }
    deptGroups[key].tasks.push(task);
  });

  const handleMouseEnter = (e, task) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip(task);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No scheduled tasks to display. Run optimization to generate a plan.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Time Header */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div className="w-44 flex-shrink-0 border-r border-slate-200 px-3 py-2 font-semibold text-xs text-slate-600 uppercase tracking-wide">
              Department
            </div>
            <div className="flex-1 flex">
              {hours.slice(0, -1).map(hour => (
                <div key={hour} className="flex-1 border-r border-slate-200 flex items-center justify-start pl-1.5 text-xs text-slate-400 py-2">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Department Rows */}
          {Object.entries(deptGroups).map(([deptId, dept]) => (
            <div key={deptId} className="flex border-b border-slate-100 last:border-0">
              <div className="w-44 flex-shrink-0 border-r border-slate-200 px-3 py-3 bg-white flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                  <span className="font-medium text-sm text-slate-800">{dept.name}</span>
                </div>
                <span className="text-xs text-slate-400 ml-5">{dept.tasks.length} task{dept.tasks.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex-1 relative" style={{ minHeight: `${Math.max(48, dept.tasks.length * 32 + 16)}px` }}>
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {hours.slice(0, -1).map(hour => (
                    <div key={hour} className="flex-1 border-r border-slate-50" />
                  ))}
                </div>

                {/* Task bars */}
                {dept.tasks.map((task, idx) => {
                  const startSlot = timeToSlot(task.startTime);
                  const endSlot = timeToSlot(task.endTime);
                  const leftPct = (startSlot / totalSlots) * 100;
                  const widthPct = Math.max(2, ((endSlot - startSlot) / totalSlots) * 100);
                  const topPx = 4 + idx * 32;

                  return (
                    <div
                      key={task.id}
                      className="absolute rounded shadow-sm cursor-pointer transition-all hover:shadow-md hover:brightness-110 flex items-center px-2 overflow-hidden group"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        top: `${topPx}px`,
                        height: '28px',
                        backgroundColor: task.color || dept.color,
                      }}
                      onClick={() => onTaskClick?.(task)}
                      onMouseEnter={(e) => handleMouseEnter(e, task)}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <span className="text-white text-xs font-medium truncate">
                        {task.id} — {task.name}
                      </span>
                      {task.compatibilityGroup && (
                        <span className="ml-1 text-white/70 text-[10px]">🔗</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        {Object.entries(deptGroups).map(([deptId, dept]) => (
          <div key={deptId} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: dept.color }} />
            {dept.name}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span>🔗</span> Compatible group
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-900 text-white rounded-lg shadow-xl px-3 py-2 text-xs pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="font-bold">{tooltip.id}: {tooltip.name}</div>
          <div className="text-slate-300 mt-0.5">{tooltip.departmentName} • {tooltip.section}</div>
          <div className="text-slate-300">{tooltip.startTime} – {tooltip.endTime} • Priority: {tooltip.priority?.toFixed(1)}</div>
          {tooltip.assetId && <div className="text-slate-400">Asset: {tooltip.assetId}</div>}
          <div className="text-slate-400 mt-1">Click to view details</div>
        </div>
      )}
    </div>
  );
}
