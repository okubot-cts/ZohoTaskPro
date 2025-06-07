import { useState, useEffect } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { Filter as FilterType, TaskPriority, TaskStatus, User } from '../../types';
import { Button } from '../common/Button';

interface TaskFilterProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: FilterType;
  onApplyFilter: (filter: FilterType) => void;
  onClearFilter: () => void;
  users: User[]; // Add users prop for assignee filter
}

export const TaskFilter: React.FC<TaskFilterProps> = ({
  isOpen,
  onClose,
  currentFilter,
  onApplyFilter,
  onClearFilter,
  users,
}) => {
  const [tempFilter, setTempFilter] = useState<FilterType>(currentFilter);

  useEffect(() => {
    setTempFilter(currentFilter);
  }, [currentFilter]);
  
  const handleStatusChange = (status: TaskStatus) => {
    setTempFilter((prev: FilterType) => {
      const statusArray = Array.isArray(prev.status) ? [...prev.status] : [];
      
      if (statusArray.includes(status)) {
        return {
          ...prev,
          status: statusArray.filter(s => s !== status),
        };
      } else {
        return {
          ...prev,
          status: [...statusArray, status],
        };
      }
    });
  };
  
  const handlePriorityChange = (priority: TaskPriority) => {
    setTempFilter((prev: FilterType) => {
      const priorityArray = Array.isArray(prev.priority) ? [...prev.priority] : [];
      
      if (priorityArray.includes(priority)) {
        return {
          ...prev,
          priority: priorityArray.filter(p => p !== priority),
        };
      } else {
        return {
          ...prev,
          priority: [...priorityArray, priority],
        };
      }
    });
  };

  const handleAssigneeChange = (userId: string) => {
    setTempFilter((prev: FilterType) => {
      const assigneeArray = Array.isArray(prev.assignedTo) ? [...prev.assignedTo] : [];
      if (assigneeArray.includes(userId)) {
        return {
          ...prev,
          assignedTo: assigneeArray.filter(id => id !== userId),
        };
      } else {
        return {
          ...prev,
          assignedTo: [...assigneeArray, userId],
        };
      }
    });
  };
  
  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setTempFilter((prev: FilterType) => ({
      ...prev,
      dueDate: {
        ...prev.dueDate,
        [field]: value,
      },
    }));
  };
  
  const handleApply = () => {
    onApplyFilter(tempFilter);
    onClose();
  };
  
  const handleClearInternal = () => {
    setTempFilter({});
    onClearFilter();
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Tasks</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TaskStatus).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    tempFilter.status?.includes(status)
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TaskPriority).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handlePriorityChange(priority)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    tempFilter.priority?.includes(priority)
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <div className="flex flex-wrap gap-2">
              {users.map((user: User) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleAssigneeChange(user.id)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    tempFilter.assignedTo?.includes(user.id)
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="dueDateFrom" className="sr-only">Due Date From</label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDateFrom"
                    name="dueDateFrom"
                    value={tempFilter.dueDate?.from || ''}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="dueDateTo" className="sr-only">Due Date To</label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDateTo"
                    name="dueDateTo"
                    value={tempFilter.dueDate?.to || ''}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClearInternal}>
            Clear All
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};