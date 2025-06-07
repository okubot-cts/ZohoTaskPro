import { create } from 'zustand';
import { Filter, KanbanAxis, SortOption, Task, TaskStatus, ViewMode } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: Filter;
  sort: SortOption;
  viewMode: ViewMode;
  kanbanAxis: KanbanAxis;
  selectedTasks: string[];
  
  // Task CRUD actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  // Loading/error state
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filter/Sort/View actions
  setFilter: (filter: Partial<Filter>) => void;
  clearFilter: () => void;
  setSort: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setKanbanAxis: (axis: KanbanAxis) => void;
  
  // Selection actions
  selectTask: (id: string) => void;
  deselectTask: (id: string) => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  bulkUpdateTasks: (updates: Partial<Task>) => void;
}

const initialState = {
  tasks: [],
  isLoading: false,
  error: null,
  filter: {},
  sort: { field: 'dueDate', direction: 'asc' },
  viewMode: ViewMode.List,
  kanbanAxis: KanbanAxis.Status,
  selectedTasks: [],
};

export const useTaskStore = create<TaskState>((set) => ({
  ...initialState,
  
  // Task CRUD actions
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => 
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id ? { ...task, ...updates } : task
      )
    })),
  removeTask: (id) => 
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      selectedTasks: state.selectedTasks.filter((taskId) => taskId !== id)
    })),
  
  // Loading/error state
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Filter/Sort/View actions
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
  clearFilter: () => set({ filter: {} }),
  setSort: (sort) => set({ sort }),
  setViewMode: (viewMode) => set({ viewMode }),
  setKanbanAxis: (kanbanAxis) => set({ kanbanAxis }),
  
  // Selection actions
  selectTask: (id) => 
    set((state) => ({
      selectedTasks: state.selectedTasks.includes(id) 
        ? state.selectedTasks 
        : [...state.selectedTasks, id]
    })),
  deselectTask: (id) => 
    set((state) => ({
      selectedTasks: state.selectedTasks.filter((taskId) => taskId !== id)
    })),
  toggleTaskSelection: (id) => 
    set((state) => ({
      selectedTasks: state.selectedTasks.includes(id)
        ? state.selectedTasks.filter((taskId) => taskId !== id)
        : [...state.selectedTasks, id]
    })),
  selectAllTasks: () => 
    set((state) => ({
      selectedTasks: state.tasks.map((task) => task.id)
    })),
  clearSelection: () => set({ selectedTasks: [] }),
  bulkUpdateTasks: (updates) => 
    set((state) => ({
      tasks: state.tasks.map((task) => 
        state.selectedTasks.includes(task.id) 
          ? { ...task, ...updates } 
          : task
      )
    })),
}));