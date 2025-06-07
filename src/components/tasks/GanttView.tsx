import { useState } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import { addDays } from 'date-fns';
import { Task, TaskStatus } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import 'gantt-task-react/dist/index.css';

interface GanttViewProps {
  tasks: Task[];
}

export const GanttView: React.FC<GanttViewProps> = ({ tasks }) => {
  const { updateTask } = useTaskStore();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  
  const ganttTasks: GanttTask[] = tasks.map((task: Task) => ({
    id: task.id,
    name: task.subject,
    start: new Date(task.dueDate || new Date()),
    end: addDays(new Date(task.dueDate || new Date()), 1),
    progress: task.status === TaskStatus.Completed ? 100 :
             task.status === TaskStatus.InProgress ? 50 : 0,
    type: 'task',
    project: task.relatedRecord?.name || 'Unassigned',
    dependencies: [],
    isDisabled: false,
    styles: {
      progressColor: task.priority === 'High' ? '#EF4444' :
                    task.priority === 'Medium' ? '#F59E0B' : '#10B981',
      progressSelectedColor: '#2563EB',
      backgroundColor: task.priority === 'High' ? '#FEE2E2' :
                      task.priority === 'Medium' ? '#FEF3C7' : '#D1FAE5',
    },
  }));

  const handleTaskChange = (task: GanttTask) => {
    const originalTask = tasks.find((t: Task) => t.id === task.id);
    if (!originalTask) return;

    // Update the task's due date based on the Gantt task's end date
    updateTask(task.id, {
      dueDate: task.end.toISOString().split('T')[0],
    });
  };

  const handleProgressChange = (task: GanttTask) => {
    const originalTask = tasks.find((t: Task) => t.id === task.id);
    if (!originalTask) return;

    // Update task status based on progress
    let newStatus = originalTask.status;
    if (task.progress === 100) {
      newStatus = TaskStatus.Completed;
    } else if (task.progress > 0) {
      newStatus = TaskStatus.InProgress;
    } else {
      newStatus = TaskStatus.NotStarted;
    }

    updateTask(task.id, { status: newStatus });
  };

  const handleDblClick = (task: GanttTask) => {
    // Optional: Add double-click handling if needed
    console.log('Double clicked task:', task);
  };

  const handleSelect = (task: GanttTask, isSelected: boolean) => {
    console.log('Selected task:', task, isSelected);
  };

  const handleExpanderClick = (task: GanttTask) => {
    console.log('Expander clicked:', task);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex justify-end space-x-2 p-4 border-b">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as ViewMode)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
        >
          <option value={ViewMode.QuarterDay}>Quarter Day</option>
          <option value={ViewMode.HalfDay}>Half Day</option>
          <option value={ViewMode.Day}>Day</option>
          <option value={ViewMode.Week}>Week</option>
          <option value={ViewMode.Month}>Month</option>
        </select>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onProgressChange={handleProgressChange}
          onDoubleClick={handleDblClick}
          onSelect={handleSelect}
          onExpanderClick={handleExpanderClick}
          listCellWidth=""
          columnWidth={60}
          barCornerRadius={4}
          handleWidth={8}
          todayColor="rgba(37, 99, 235, 0.1)"
          projectProgressBarStyles={{
            backgroundImage: 'none',
            backgroundColor: '#60A5FA',
          }}
          TooltipContent={({ task }: { task: GanttTask }) => (
            <div className="bg-white p-2 rounded shadow-lg border text-sm">
              <div className="font-medium">{task.name}</div>
              <div className="text-gray-500">
                Progress: {task.progress}%
              </div>
              <div className="text-gray-500">
                Due: {task.end.toLocaleDateString()}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};