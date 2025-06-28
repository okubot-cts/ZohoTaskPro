import React from 'react';
import { useSortable, AnimateLayoutChanges, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority } from '../types';
import { Calendar, User, Tag, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  checked?: boolean;
  onCheck?: () => void;
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-600', icon: null },
  medium: { color: 'bg-blue-100 text-blue-600', icon: null },
  high: { color: 'bg-orange-100 text-orange-600', icon: AlertCircle },
  urgent: { color: 'bg-red-100 text-red-600', icon: AlertCircle }
};

const statusConfig = {
  todo: { color: 'border-gray-300', icon: Clock },
  'in-progress': { color: 'border-blue-300', icon: TrendingUp },
  review: { color: 'border-yellow-300', icon: Clock },
  done: { color: 'border-green-300', icon: CheckCircle }
};

const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  if (args.isSorting || args.wasDragging) {
    return true;
  }
  return defaultAnimateLayoutChanges(args);
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, checked, onCheck }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ id: task.id, animateLayoutChanges });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.25)' : undefined,
    opacity: isDragging ? 0.7 : 1,
    scale: isDragging ? 1.04 : 1,
  } as React.CSSProperties;

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const PriorityIcon = priority.icon;
  const StatusIcon = status.icon;

  const isOverdue = new Date() > parseISO(task.dueDate) && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative task-card transition-all duration-200 ${status.color} ${isOverdue ? 'border-red-400 bg-red-50' : ''} ${
        isDragging ? 'shadow-2xl scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start flex-1 min-w-0">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            onClick={e => { e.stopPropagation(); onCheck && onCheck(); }}
            className="mr-2 mt-0.5 flex-shrink-0"
          />
          <h3 className="font-medium text-gray-900 text-xs md:text-sm leading-tight flex-1 min-w-0 break-words">
            {task.title}
          </h3>
        </div>
        <StatusIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0 ml-1 md:ml-2" />
      </div>

      {task.description && (
        <p className="text-gray-600 text-xs mb-2 md:mb-3 line-clamp-2 break-words">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center space-x-1 md:space-x-2 min-w-0 flex-1">
          <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">
            {typeof task.assignee === 'object' ? task.assignee.name : String(task.assignee)}
          </span>
        </div>
        <div className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium ${priority.color} flex-shrink-0`}>
          {task.priority === 'low' && '低'}
          {task.priority === 'medium' && '中'}
          {task.priority === 'high' && '高'}
          {task.priority === 'urgent' && '緊急'}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {format(parseISO(task.dueDate), 'M/d', { locale: ja })}
          </span>
        </div>
        {task.relatedDeal && (
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">
              ¥{(task.relatedDeal.amount / 10000).toFixed(0)}万
            </span>
          </div>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs bg-gray-100 text-gray-600"
            >
              <Tag className="w-2 h-2 mr-1" />
              <span className="truncate max-w-16 md:max-w-20">{tag}</span>
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}; 