export default function TaskSelector({ tasks, selectedTasks, onSelectionChange }) {
  const toggleTask = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      onSelectionChange(selectedTasks.filter(id => id !== taskId));
    } else {
      onSelectionChange([...selectedTasks, taskId]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[400px] flex flex-col">
      <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-sm">
        Select Tasks for Planning ({selectedTasks.length} selected)
      </div>
      <div className="overflow-y-auto p-2">
        {tasks.map(task => (
          <label key={task.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedTasks.includes(task.id)}
              onChange={() => toggleTask(task.id)}
              className="mt-1 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-800">{task.id}: {task.name}</div>
              <div className="text-xs text-slate-500">{task.department} • Priority: {task.priorityScore}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
