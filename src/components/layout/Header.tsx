import { useState } from 'react';
import { Settings, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { ViewMode } from '../../types';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { clearAuth } = useAuthStore();
  const { filter, setFilter } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState(filter.search || '');
  
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
    </header>
  );
};