import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, useDraggable, useDroppable } from '@dnd-kit/core';
import { Task, User, KanbanAxis, TaskStatus, TaskPriority } from '../../types';
import { useTaskStore } from '../../store/taskStore';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
}

interface TaskCardProps {
  task: Task;
  assignee: User | null;
  onClick: (task: Task) => void;
}

const TaskCard = ({ task, assignee, onClick }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: task
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const priorityColors = {
    [TaskPriority.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [TaskPriority.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">{task.subject}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {assignee ? (
            <div className="flex items-center gap-1">
              <img
                src={assignee.profilePicture}
                alt={assignee.name}
                className="w-6 h-6 rounded-full"
              />
              <span>{assignee.name}</span>
            </div>
          ) : (
            <span className="text-gray-400">未アサイン</span>
          )}
        </div>
        <span>#{task.id}</span>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
}

const KanbanColumn = ({ id, title, tasks, users, onTaskClick }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-4 ${
        isOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
      }`}
    >
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
        {title}
        <span className="ml-2 text-sm text-gray-500">
          ({tasks.length})
        </span>
      </h3>
      <div className="space-y-3">
        {tasks.map(task => {
          const assignee = task.assignedTo ? users.find(u => u.id === task.assignedTo?.id) || null : null;
          return (
            <TaskCard
              key={task.id}
              task={task}
              assignee={assignee}
              onClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export const KanbanBoard = ({ 
  tasks, 
  users, 
  onTaskClick 
}: KanbanBoardProps) => {
  const { updateTask } = useTaskStore();
  const [groupByAxis, setGroupByAxis] = useState<KanbanAxis | 'none'>('none');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t: Task) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t: Task) => t.id === active.id);
    if (!task) return;

    let updates: Partial<Task> = {};
    switch (groupByAxis) {
      case KanbanAxis.Status:
        updates.status = over.id as TaskStatus;
        break;
      case KanbanAxis.Priority:
        updates.priority = over.id as TaskPriority;
        break;
      case KanbanAxis.AssignedTo:
        const user = users.find((u: User) => u.id === over.id);
        if (user) {
          updates.assignedTo = user;
        } else if (over.id === 'unassigned') {
          updates.assignedTo = undefined;
        }
        break;
    }

    if (Object.keys(updates).length > 0) {
      updateTask(task.id, updates);
    }
    setActiveTask(null);
  };

  const getColumnsForAxis = () => {
    switch (groupByAxis) {
      case KanbanAxis.Status:
        return [
          { id: TaskStatus.NotStarted, title: '未着手' },
          { id: TaskStatus.InProgress, title: '進行中' },
          { id: TaskStatus.Completed, title: '完了' }
        ];
      case KanbanAxis.Priority:
        return [
          { id: TaskPriority.High, title: '高' },
          { id: TaskPriority.Medium, title: '中' },
          { id: TaskPriority.Low, title: '低' }
        ];
      case KanbanAxis.AssignedTo:
        return [
          { id: 'unassigned', title: '未アサイン' },
          ...users.map((user: User) => ({ id: user.id, title: user.name }))
        ];
      default:
        return [];
    }
  };

  const getGroupedTasks = () => {
    const columns = getColumnsForAxis();
    const grouped: { [key: string]: Task[] } = {};

    columns.forEach(column => {
      grouped[column.id] = tasks.filter((task: Task) => {
        switch (groupByAxis) {
          case KanbanAxis.Status:
            return task.status === column.id;
          case KanbanAxis.Priority:
            return task.priority === column.id;
          case KanbanAxis.AssignedTo:
            if (column.id === 'unassigned') {
              return !task.assignedTo;
            }
            return task.assignedTo?.id === column.id;
          default:
            return false;
        }
      });
    });

    return grouped;
  };

  const columns = getColumnsForAxis();
  const groupedTasks = getGroupedTasks();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border-b">
        <select
          value={groupByAxis}
          onChange={(e) => setGroupByAxis(e.target.value as KanbanAxis | 'none')}
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="none">グループ化なし</option>
          <option value={KanbanAxis.Status}>ステータス</option>
          <option value={KanbanAxis.Priority}>優先度</option>
          <option value={KanbanAxis.AssignedTo}>担当者</option>
        </select>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={groupedTasks[column.id] || []}
              users={users}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              assignee={activeTask.assignedTo ? users.find(u => u.id === activeTask.assignedTo?.id) || null : null}
              onClick={onTaskClick}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};