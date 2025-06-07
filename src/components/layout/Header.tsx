import { useState } from 'react';
import { Settings, LogOut, Search, Plus, List, LayoutGrid, Calendar, Table } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { ViewMode } from '../../types';
import { Button } from '../common/Button';
import { TaskModal } from '../tasks/TaskModal';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const VIEW_OPTIONS = [
  { mode: ViewMode.List, icon: List, label: 'List' },
  { mode: ViewMode.Kanban, icon: LayoutGrid, label: 'Kanban' },
  { mode: ViewMode.Calendar, icon: Calendar, label: 'Calendar' },
  { mode: ViewMode.Gantt, icon: Table, label: 'Gantt' },
];

export const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode }) => {
  const { clearAuth } = useAuthStore();
  const { filter, setFilter } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState(filter.search || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ search: searchQuery });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setFilter({ search: '' });
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <h1 className="text-xl font-bold text-gray-900 mr-4">ZohoTask Pro</h1>
          <Button 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="mr-4"
          >
            Create Task
          </Button>
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
        
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
            <Search className="absolute left-2 h-4 w-4 text-gray-400" />
          </form>
          <button onClick={clearAuth} className="text-gray-600 hover:text-gray-800 flex items-center text-sm">
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
          <button className="text-gray-600 hover:text-gray-800 flex items-center text-sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </button>
        </div>
      </div>
      <TaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </header>
  );
};