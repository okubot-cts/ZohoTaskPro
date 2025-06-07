import { useState, useRef, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, ChevronDown, ChevronUp, Copy, Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskStatus, RelatedRecord, TaskPriority, KanbanAxis, TaskCategory } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { Button } from '../common/Button';
import { RelatedRecordSelect } from './RelatedRecordSelect';

interface TaskListProps {
  tasks: Task[];
}

export const TaskList: React.FC<TaskListProps> = ({ tasks }: TaskListProps) => {
  const { 
    sort, 
    setSort, 
    selectedTasks, 
    toggleTaskSelection, 
    selectAllTasks, 
    clearSelection, 
    updateTask,
    bulkUpdateTasks,
    removeTask,
    addTask,
    kanbanAxis,
  } = useTaskStore();
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null); // To manage context menu open state by task id
  const menuButtonRef = useRef<{ [key: string]: HTMLButtonElement | null }>({}); // To store refs for each menu button
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  // Group By State
  const [groupByAxis, setGroupByAxis] = useState<KanbanAxis | 'none'>('none');

  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen && menuButtonRef.current[isMenuOpen]) {
      const rect = menuButtonRef.current[isMenuOpen]!.getBoundingClientRect();
      const menuWidth = 160; // w-40 in Tailwind CSS is 160px
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom,
        right: window.innerWidth - rect.right,
      });
    }

    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click occurred outside the button and outside the menu itself
      if (isMenuOpen && 
          menuButtonRef.current[isMenuOpen] && 
          !menuButtonRef.current[isMenuOpen]!.contains(event.target as Node) && 
          document.getElementById(`task-menu-${isMenuOpen}`) && 
          !document.getElementById(`task-menu-${isMenuOpen}`)!.contains(event.target as Node)
      ) {
        setIsMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSort = (field: keyof Task) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ field, direction: newDirection });
  };
  
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };
  
  const handleInlineEdit = (task: Task, field: string) => {
    setEditingTaskId(task.id);
    setEditingField(field);
    setEditValue(task[field as keyof Task] as string);
  };
  
  const handleInlineEditSave = () => {
    if (editingTaskId && editingField) {
      updateTask(editingTaskId, { [editingField]: editValue });
      setEditingTaskId(null);
      setEditingField(null);
    }
  };
  
  const handleInlineEditCancel = () => {
    setEditingTaskId(null);
    setEditingField(null);
  };
  
  const handleRelatedRecordChange = (taskId: string, record: RelatedRecord | null) => {
    updateTask(taskId, { relatedRecord: record || undefined });
  };
  
  const handleDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      removeTask(taskId);
      setIsMenuOpen(null); // Close menu after action
    }
  };
  
  const handleCopyTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      subject: `${task.subject} (Copy)`,
    };
    addTask(newTask);
    setIsMenuOpen(null); // Close menu after action
  };
  
  const handleAddTask = () => {
    if (newTaskSubject.trim()) {
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 9),
        subject: newTaskSubject.trim(),
        status: TaskStatus.NotStarted,
        priority: TaskPriority.Medium,
      };
      addTask(newTask);
      setNewTaskSubject('');
      setIsAddingTask(false);
    }
  };
  
  const areAllSelected = tasks.length > 0 && tasks.every(task => selectedTasks.includes(task.id));
  
  const handleSelectAll = () => {
    if (areAllSelected) {
      clearSelection();
    } else {
      selectAllTasks();
    }
  };
  
  const handleBulkComplete = () => {
    bulkUpdateTasks({ status: TaskStatus.Completed });
  };
  
  const getSortIcon = (field: keyof Task) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-error-600 bg-error-50';
      case 'Medium': return 'text-warning-600 bg-warning-50';
      case 'Low': return 'text-success-600 bg-success-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-success-600 bg-success-50';
      case 'In Progress': return 'text-primary-600 bg-primary-50';
      case 'Waiting': return 'text-warning-600 bg-warning-50';
      case 'Deferred': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getGroupTitle = (groupKey: string, tasksInGroup: Task[]): string => {
    if (groupByAxis === 'none') return 'All Tasks';
    if (groupKey === 'Unassigned' || groupKey === 'No Due Date') {
      return groupKey;
    }
  
    const firstTask = tasksInGroup[0];
    if (!firstTask) return groupKey; // Should not happen if groupedTasks are correctly formed
  
    switch (groupByAxis) {
      case KanbanAxis.Status:
      case KanbanAxis.Priority:
      case KanbanAxis.Category:
        return groupKey; // These are already simple strings
      case KanbanAxis.DueDate:
        return format(new Date(groupKey), 'MMM d, yyyy'); // groupKey is the date string
      case KanbanAxis.AssignedTo:
        return firstTask.assignedTo?.name || 'Unassigned';
      case KanbanAxis.RelatedRecord:
        return firstTask.relatedRecord?.name || 'Unassigned';
      default:
        return groupKey;
    }
  };

  const getGroupedTasks = () => {
    if (groupByAxis === 'none') {
      return { 'All Tasks': tasks };
    }

    const grouped: { [key: string]: Task[] } = {};

    tasks.forEach(task => {
      let groupKey: string = 'Unassigned';

      switch (groupByAxis) {
        case KanbanAxis.Status:
          groupKey = task.status || 'Unassigned';
          break;
        case KanbanAxis.Priority:
          groupKey = task.priority || 'Unassigned';
          break;
        case KanbanAxis.AssignedTo:
          groupKey = task.assignedTo?.id || 'Unassigned';
          break;
        case KanbanAxis.Category:
          groupKey = task.category || 'Unassigned';
          break;
        case KanbanAxis.RelatedRecord:
          groupKey = task.relatedRecord?.id || 'Unassigned';
          break;
        case KanbanAxis.DueDate:
          groupKey = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : 'No Due Date';
          break;
        default:
          groupKey = 'Other';
          break;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });

    // Sort groups for consistent display
    const sortedGroupedKeys = Object.keys(grouped).sort((a, b) => {
      if (groupByAxis === KanbanAxis.Status) {
        const order = [TaskStatus.NotStarted, TaskStatus.InProgress, TaskStatus.Waiting, TaskStatus.Deferred, TaskStatus.Completed];
        return order.indexOf(a as TaskStatus) - order.indexOf(b as TaskStatus);
      } else if (groupByAxis === KanbanAxis.Priority) {
        const order = [TaskPriority.High, TaskPriority.Medium, TaskPriority.Low];
        return order.indexOf(a as TaskPriority) - order.indexOf(b as TaskPriority);
      } else if (groupByAxis === KanbanAxis.DueDate) {
        if (a === 'No Due Date') return 1;
        if (b === 'No Due Date') return -1;
        return a.localeCompare(b);
      }
      return a.localeCompare(b);
    });

    const sortedGrouped: { [key: string]: Task[] } = {};
    sortedGroupedKeys.forEach(key => {
      sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  };

  const filteredTasks = tasks.filter(task => {
    // Filter by status
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    // Filter by priority
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterPriority('all');
  };

  const sortedAndFilteredTasks = () => {
    let currentTasks = [...filteredTasks];

    // Apply sorting
    if (sort) {
      currentTasks.sort((a, b) => {
        const aValue = a[sort.field as keyof Task];
        const bValue = b[sort.field as keyof Task];
        
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        // Special handling for date comparison
        if (sort.field === 'dueDate' && aValue && bValue) {
          const dateA = new Date(aValue as string);
          const dateB = new Date(bValue as string);
          const comparison = dateA.getTime() - dateB.getTime();
          return sort.direction === 'asc' ? comparison : -comparison;
        }
        
        // Generic comparison for other types
        const comparison = String(aValue) < String(bValue) ? -1 : String(aValue) > String(bValue) ? 1 : 0;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }
    return currentTasks;
  };

  const displayedTasks = sortedAndFilteredTasks();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Task
          </button>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">すべてのステータス</option>
              <option value="not_started">未着手</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">すべての優先度</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          {(filterStatus !== 'all' || filterPriority !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/20 rounded-md"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {selectedTasks.length > 0 && (
        <div className="bg-primary-50 p-3 flex items-center justify-between">
          <div>
            <span className="text-primary-700 font-medium">{selectedTasks.length} tasks selected</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="primary" 
              leftIcon={<CheckCircle className="h-4 w-4" />}
              onClick={handleBulkComplete}
            >
              Complete
            </Button>
            <Button size="sm" variant="outline" onClick={clearSelection}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Group by:</span>
            <select
              value={groupByAxis}
              onChange={(e) => setGroupByAxis(e.target.value as KanbanAxis | 'none')}
              className="text-sm rounded border border-gray-300 py-1 pl-2 pr-8"
            >
              <option value="none">None</option>
              <option value={KanbanAxis.Status}>Status</option>
              <option value={KanbanAxis.Priority}>Priority</option>
              <option value={KanbanAxis.AssignedTo}>Assigned To</option>
              <option value={KanbanAxis.Category}>Category</option>
              <option value={KanbanAxis.RelatedRecord}>Related Record</option>
              <option value={KanbanAxis.DueDate}>Due Date</option>
            </select>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary-600 transition duration-150 ease-in-out"
                  checked={areAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('subject')}
              >
                <div className="flex items-center">
                  <span>Subject</span>
                  {getSortIcon('subject')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center">
                  <span>Priority</span>
                  {getSortIcon('priority')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center">
                  <span>Due Date</span>
                  {getSortIcon('dueDate')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Record</th>
              <th className="relative px-4 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(getGroupedTasks()).map(([groupKey, groupTasks]) => (
              <Fragment key={groupKey}>
                {groupByAxis !== 'none' && (
                  <tr>
                    <td colSpan={8} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm">
                      {getGroupTitle(groupKey, groupTasks)}
                    </td>
                  </tr>
                )}
                {groupTasks.length === 0 && groupByAxis !== 'none' && (
                  <tr>
                    <td colSpan={8} className="px-4 py-2 text-gray-500 text-sm italic">
                      No tasks in this group.
                    </td>
                  </tr>
                )}
                {groupTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary-600 transition duration-150 ease-in-out"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {editingTaskId === task.id && editingField === 'subject' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleInlineEditSave}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleInlineEditSave(); if (e.key === 'Escape') handleInlineEditCancel(); }}
                          autoFocus
                          className="border rounded-md px-2 py-1 w-full"
                        />
                      ) : (
                        <span
                          className="text-sm text-gray-900 cursor-pointer"
                          onClick={() => handleInlineEdit(task, 'subject')}
                        >
                          {task.subject}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {editingTaskId === task.id && editingField === 'status' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleInlineEditSave}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleInlineEditSave(); if (e.key === 'Escape') handleInlineEditCancel(); }}
                          autoFocus
                          className="border rounded-md px-2 py-1 w-full"
                        >
                          {Object.values(TaskStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusColor(task.status)
                          }`}
                          onClick={() => handleInlineEdit(task, 'status')}
                        >
                          {task.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {editingTaskId === task.id && editingField === 'priority' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleInlineEditSave}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleInlineEditSave(); if (e.key === 'Escape') handleInlineEditCancel(); }}
                          autoFocus
                          className="border rounded-md px-2 py-1 w-full"
                        >
                          {Object.values(TaskPriority).map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getPriorityColor(task.priority)
                          }`}
                          onClick={() => handleInlineEdit(task, 'priority')}
                        >
                          {task.priority}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {editingTaskId === task.id && editingField === 'dueDate' ? (
                        <input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleInlineEditSave}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleInlineEditSave(); if (e.key === 'Escape') handleInlineEditCancel(); }}
                          autoFocus
                          className="border rounded-md px-2 py-1 w-full"
                        />
                      ) : (
                        <span
                          className={`cursor-pointer ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed ? 'text-red-500' : ''}`}
                          onClick={() => handleInlineEdit(task, 'dueDate')}
                        >
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {editingTaskId === task.id && editingField === 'relatedRecord' ? (
                        <RelatedRecordSelect
                          value={task.relatedRecord || undefined}
                          onChange={(record: RelatedRecord | null) => {
                            handleRelatedRecordChange(task.id, record);
                            handleInlineEditSave();
                          }}
                        />
                      ) : (
                        <span 
                          className="cursor-pointer"
                          onClick={() => handleInlineEdit(task, 'relatedRecord')}
                        >
                          {task.relatedRecord?.name || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button
                          ref={el => menuButtonRef.current[task.id] = el}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(isMenuOpen === task.id ? null : task.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        {isMenuOpen === task.id && createPortal(
                          <div
                            id={`task-menu-${task.id}`}
                            className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="menu-button"
                            style={menuStyle}
                          >
                            <div className="py-1" role="none">
                              <button
                                onClick={() => handleInlineEdit(task, 'subject')}
                                className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                              >
                                <Edit className="inline-block w-4 h-4 mr-2" />Edit
                              </button>
                              <button
                                onClick={() => handleCopyTask(task)}
                                className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                              >
                                <Copy className="inline-block w-4 h-4 mr-2" />Copy
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                role="menuitem"
                              >
                                <Trash2 className="inline-block w-4 h-4 mr-2" />Delete
                              </button>
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
            {displayedTasks.length === 0 && groupByAxis === 'none' && (
              <tr>
                <td colSpan={8} className="px-4 py-2 text-center text-gray-500 italic">
                  No tasks found.
                </td>
              </tr>
            )}
            {isAddingTask && (
              <tr>
                <td className="px-4 py-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-primary-600" disabled />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    className="border rounded-md px-2 py-1 w-full"
                    placeholder="New task subject"
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask();
                      if (e.key === 'Escape') setIsAddingTask(false);
                    }}
                    ref={newTaskInputRef}
                    autoFocus
                  />
                </td>
                <td colSpan={6}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};