import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, LayoutGrid, List, Table } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Toolbar } from '../components/layout/Toolbar';
import { TaskList } from '../components/tasks/TaskList';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { CalendarView } from '../components/tasks/CalendarView';
import { GanttView } from '../components/tasks/GanttView';
import { useTaskStore } from '../store/taskStore';
import { Task, TaskPriority, TaskStatus, ViewMode, User } from '../types';

// Mock data for development
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    subject: 'Complete project proposal',
    status: TaskStatus.InProgress,
    priority: TaskPriority.High,
    dueDate: '2025-02-15',
    description: 'Draft and finalize the Q1 project proposal',
    assignedTo: { id: '1', name: '山田太郎', email: 'yamada@example.com', profilePicture: 'https://i.pravatar.cc/150?img=1' },
    createdBy: { id: '2', name: '鈴木花子', email: 'suzuki@example.com', profilePicture: 'https://i.pravatar.cc/150?img=2' },
  },
  {
    id: '2',
    subject: 'Client meeting',
    status: TaskStatus.NotStarted,
    priority: TaskPriority.Medium,
    dueDate: '2025-02-10',
    description: 'Discuss requirements for new feature set',
    assignedTo: { id: '2', name: '鈴木花子', email: 'suzuki@example.com', profilePicture: 'https://i.pravatar.cc/150?img=2' },
    createdBy: { id: '1', name: '山田太郎', email: 'yamada@example.com', profilePicture: 'https://i.pravatar.cc/150?img=1' },
  },
  {
    id: '3',
    subject: 'Review code changes',
    status: TaskStatus.Completed,
    priority: TaskPriority.Low,
    dueDate: '2025-02-08',
    description: 'Review and merge pending pull requests',
    createdBy: { id: '1', name: '山田太郎', email: 'yamada@example.com', profilePicture: 'https://i.pravatar.cc/150?img=1' },
  }
];

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    profilePicture: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '2',
    name: '鈴木花子',
    email: 'suzuki@example.com',
    profilePicture: 'https://i.pravatar.cc/150?img=2'
  }
];

const VIEW_OPTIONS = [
  { mode: ViewMode.List, icon: List, label: 'List' },
  { mode: ViewMode.Kanban, icon: LayoutGrid, label: 'Kanban' },
  { mode: ViewMode.Calendar, icon: Calendar, label: 'Calendar' },
  { mode: ViewMode.Gantt, icon: Table, label: 'Gantt' },
];

export const Dashboard: React.FC = () => {
  const { tasks, setTasks, viewMode, setViewMode, filter, sort } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(MOCK_TASKS);
      setIsLoading(false);
    }, 1000);
  }, [setTasks]);
  
  // Apply filters and sorting
  const sortedTasks = useMemo(() => {
    let filteredTasks = [...tasks];

    // Apply filters
    if (filter) {
      if (filter.status?.length) {
        filteredTasks = filteredTasks.filter(task => 
          filter.status!.includes(task.status)
        );
      }
      
      if (filter.priority?.length) {
        filteredTasks = filteredTasks.filter(task => 
          filter.priority!.includes(task.priority)
        );
      }

      if (filter.assignedTo) {
        filteredTasks = filteredTasks.filter(task => 
          task.assignedTo?.id === filter.assignedTo
        );
      }

      if (filter.dueDate?.from) {
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && task.dueDate >= filter.dueDate!.from!
        );
      }

      if (filter.dueDate?.to) {
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && task.dueDate <= filter.dueDate!.to!
        );
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.subject.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Apply sorting
    if (sort) {
      filteredTasks.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filteredTasks;
  }, [tasks, filter, sort]);

  const renderView = () => {
    switch (viewMode) {
      case ViewMode.List:
        return <TaskList tasks={sortedTasks} />;
      case ViewMode.Kanban:
        return <KanbanBoard tasks={sortedTasks} users={MOCK_USERS} />;
      case ViewMode.Calendar:
        return <CalendarView tasks={sortedTasks} />;
      case ViewMode.Gantt:
        return <GanttView tasks={sortedTasks} />;
      default:
        return <TaskList tasks={sortedTasks} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Toolbar />
          <div className="flex justify-end mb-4">
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

          {isLoading ? (
            <div className="bg-white shadow rounded-lg p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {renderView()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};