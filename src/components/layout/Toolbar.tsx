import React, { useState } from 'react';
import { Plus, Filter as FilterIcon, List, LayoutGrid, Calendar, Table, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../common/Button';
import { TaskModal } from '../tasks/TaskModal';
import { TaskFilter } from '../tasks/TaskFilter';
import { useTaskStore } from '../../store/taskStore';
import { ViewMode, Filter } from '../../types';

interface ToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  users: User[];
}

const VIEW_OPTIONS = [
  { mode: ViewMode.List, icon: List, label: 'List' },
  { mode: ViewMode.Kanban, icon: LayoutGrid, label: 'Kanban' },
  { mode: ViewMode.Calendar, icon: Calendar, label: 'Calendar' },
  { mode: ViewMode.Gantt, icon: Table, label: 'Gantt' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ viewMode, setViewMode, users }) => {
  const { filter, setFilter, clearFilter } = useTaskStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleApplyFilter = (newFilter: Filter) => {
    setFilter(newFilter);
  };

  const handleClearAllFilters = () => {
    clearFilter();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.status && filter.status.length > 0) count++;
    if (filter.priority && filter.priority.length > 0) count++;
    if (filter.assignedTo && filter.assignedTo.length > 0) count++;
    if (filter.dueDate && (filter.dueDate.from || filter.dueDate.to)) count++;
    if (filter.relatedRecord) count++;
    if (filter.search) count++; // Assuming search is part of the filter object
    if (filter.onlyMine) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left section: Create Task button and Filters */}
        <div className="flex items-center gap-3">
          <Button 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create Task
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FilterIcon className="h-4 w-4" />}
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </button>
          )}

          <div className="flex items-center space-x-2 border-l border-gray-200 pl-3 ml-3">
            <button
              onClick={() => setFilter({
                dueDate: {
                  from: format(new Date(), 'yyyy-MM-dd'),
                  to: format(new Date(), 'yyyy-MM-dd')
                }
              })}
              className="text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded hover:bg-primary-50"
            >
              Today
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setFilter({
                  dueDate: {
                    from: format(tomorrow, 'yyyy-MM-dd'),
                    to: format(tomorrow, 'yyyy-MM-dd')
                  }
                });
              }}
              className="text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded hover:bg-primary-50"
            >
              Tomorrow
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const endOfWeek = new Date();
                endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                setFilter({
                  dueDate: {
                    from: format(today, 'yyyy-MM-dd'),
                    to: format(endOfWeek, 'yyyy-MM-dd')
                  }
                });
              }}
              className="text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded hover:bg-primary-50"
            >
              This Week
            </button>
            <button
              onClick={() => setFilter(prev => ({ ...prev, onlyMine: !prev.onlyMine }))}
              className={`text-sm px-2 py-1 rounded flex items-center ${
                filter.onlyMine
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Users className="h-4 w-4 mr-1" />
              Only My Tasks
            </button>
          </div>
        </div>

        {/* Right section: View options */}
        <div className="flex space-x-2">
          {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${
                viewMode === mode
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <TaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <TaskFilter
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilter={filter}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearAllFilters}
        users={users}
      />
    </div>
  );
};