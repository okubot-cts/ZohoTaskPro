import { useDraggable, useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { removeTask } = useTaskStore();
  
  const getColumnColor = () => {
    switch (title) {
      case 'Completed': return 'bg-success-50 border-success-200';
      case 'In Progress': return 'bg-primary-50 border-primary-200';
      case 'Waiting': return 'bg-warning-50 border-warning-200';
      case 'Not Started': return 'bg-gray-50 border-gray-200';
      case 'Deferred': return 'bg-gray-50 border-gray-200';
      case 'High': return 'bg-error-50 border-error-200';
      case 'Medium': return 'bg-warning-50 border-warning-200';
      case 'Low': return 'bg-success-50 border-success-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 rounded-lg border ${getColumnColor()} overflow-hidden flex flex-col transition-all duration-200 ${
        isOver ? 'ring-2 ring-primary-500 ring-opacity-50 scale-[1.02]' : ''
      }`}
    >
      <div className="p-3 font-medium flex items-center justify-between border-b border-gray-200 bg-white bg-opacity-60">
        <span>{title}</span>
        <span className="text-sm font-normal text-gray-500">{tasks.length}</span>
      </div>
      
      <div className="overflow-y-auto flex-grow p-2 space-y-2">
        {tasks.length === 0 ? (
          <div className={`h-24 flex items-center justify-center text-sm text-gray-500 italic transition-colors duration-200 ${
            isOver ? 'bg-primary-50 rounded-md' : ''
          }`}>
            {isOver ? 'Drop here' : 'No tasks'}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }: TaskCardProps) => {
  const { setNodeRef, transform, listeners, attributes, isDragging } = useDraggable({ id: task.id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-error-100 text-error-700';
      case 'Medium': return 'bg-warning-100 text-warning-700';
      case 'Low': return 'bg-success-100 text-success-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-md border border-gray-200 shadow-sm p-3 cursor-grab transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg scale-105 rotate-1' : 'hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-900 flex-grow">{task.subject}</h3>
        <div className="dropdown relative">
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center space-x-1">
          {task.dueDate && (
            <span className={`${
              new Date(task.dueDate) < new Date() && task.status !== 'Completed'
                ? 'text-error-600'
                : 'text-gray-500'
            }`}>
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
        
        <div>
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {task.assignedTo && (
        <div className="mt-2 flex items-center">
          <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
            {task.assignedTo.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </div>
          <span className="ml-1 text-xs text-gray-500">{task.assignedTo.name}</span>
        </div>
      )}
      
      {task.relatedRecord && (
        <div className="mt-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {task.relatedRecord.name}
          </span>
        </div>
      )}
    </div>
  );
};