import GanttChart from './GanttChart';

export default function TimelineView({ tasks }) {
  // Simple wrapper for now, could be expanded for different views (Day, Week, Month)
  return (
    <div className="mt-4">
      <GanttChart tasks={tasks} startHour={0} endHour={24} />
    </div>
  );
}
