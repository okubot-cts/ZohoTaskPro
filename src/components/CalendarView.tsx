import React, { useState, useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskDetailModal } from './TaskDetailModal';
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay, useDroppable, useDraggable, rectIntersection } from '@dnd-kit/core';

interface CalendarViewProps {
  tasks: Task[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

type CalendarViewType = 'month' | 'week' | 'day';

// ローカル日付文字列（例: 2025/06/28）でidを生成
const getLocalDateId = (date: Date) => {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// 祝日リスト（主要な日本の祝日をハードコード）
const holidays: { [key: string]: string } = {
  '1/1': '元日',
  '2/11': '建国記念の日',
  '2/23': '天皇誕生日',
  '4/29': '昭和の日',
  '5/3': '憲法記念日',
  '5/4': 'みどりの日',
  '5/5': 'こどもの日',
  '7/15': '海の日', // 例年変動あり
  '8/11': '山の日',
  '9/16': '敬老の日', // 例年変動あり
  '9/22': '秋分の日', // 例年変動あり
  '10/14': '体育の日', // 例年変動あり
  '11/3': '文化の日',
  '11/4': '振替休日',
  '11/23': '勤労感謝の日',
};

// 祝日判定
const getHoliday = (date: Date) => {
  const key = `${date.getMonth() + 1}/${date.getDate()}`;
  return holidays[key] || null;
};

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [calendarTasks, setCalendarTasks] = useState<Task[]>(tasks);
  const [overDateId, setOverDateId] = useState<string | null>(null);
  const [showAllTasksDay, setShowAllTasksDay] = useState<CalendarDay | null>(null);
  const [addTaskDate, setAddTaskDate] = useState<Date | null>(null);
  const [addTaskTitle, setAddTaskTitle] = useState('');
  const [addTaskDesc, setAddTaskDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const calendarDays = useMemo(() => {
    const year: number = currentDate.getFullYear();
    const month: number = currentDate.getMonth();
    let startDate: Date;
    let endDate: Date;
    if (viewType === 'day') {
      startDate = new Date(currentDate);
      endDate = new Date(currentDate);
    } else if (viewType === 'week') {
      const dayOfWeek = currentDate.getDay();
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    }
    const days: CalendarDay[] = [];
    const iterDate: Date = new Date(startDate);
    while (iterDate <= endDate) {
      const dayId = getLocalDateId(iterDate);
      const dayTasks = calendarTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return getLocalDateId(taskDate) === dayId;
      });
      days.push({
        date: new Date(iterDate),
        isCurrentMonth: iterDate.getMonth() === month,
        isToday: getLocalDateId(iterDate) === getLocalDateId(new Date()),
        tasks: dayTasks
      });
      iterDate.setDate(iterDate.getDate() + 1);
    }
    return days;
  }, [currentDate, calendarTasks, viewType]);

  const handlePrevPeriod = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewType === 'day') {
        newDate.setDate(prev.getDate() - 1);
      } else if (viewType === 'week') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setMonth(prev.getMonth() - 1);
      }
      return newDate;
    });
  };

  const handleNextPeriod = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewType === 'day') {
        newDate.setDate(prev.getDate() + 1);
      } else if (viewType === 'week') {
        newDate.setDate(prev.getDate() + 7);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const getTaskStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (task: Task) => {
    return new Date(task.dueDate) < new Date() && task.status !== 'done';
  };

  const formatDate = (date: Date) => {
    if (viewType === 'day') {
      return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    } else if (viewType === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'long', year: 'numeric' });
    }
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'day': return '日ビュー';
      case 'week': return '週ビュー';
      case 'month': return '月ビュー';
      default: return 'カレンダー';
    }
  };

  // ドロップ時の処理
  const handleDragEnd = (event: any) => {
    const { active } = event;
    if (active && overDateId) {
      const taskId = active.id;
      setCalendarTasks((prev) => prev.map(task =>
        String(task.id) === String(taskId)
          ? { ...task, dueDate: overDateId }
          : task
      ));
    }
    setActiveTask(null);
    setOverDateId(null);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over && over.id) {
      setOverDateId(over.id as string);
    } else {
      setOverDateId(null);
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const task = calendarTasks.find(t => String(t.id) === String(active.id));
    if (task) {
      setActiveTask(task);
    }
  };

  interface DroppableDayProps {
    day: CalendarDay;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    style?: React.CSSProperties;
  }

  const DroppableDay: React.FC<DroppableDayProps> = ({ day, children, onClick, style }) => {
    const { setNodeRef } = useDroppable({ id: getLocalDateId(day.date) });
    const isOver = overDateId === getLocalDateId(day.date);
    const holiday = getHoliday(day.date);
    const wday = day.date.getDay();
    const isSunday = wday === 0;
    const isSaturday = wday === 6;

    return (
      <div
        ref={setNodeRef}
        onClick={onClick}
        style={style}
        className={`
          p-1 md:p-2 border border-gray-200 relative cursor-pointer
          ${viewType === 'day' ? 'min-h-96 md:min-h-[500px]' : 'min-h-24 md:min-h-32'}
          ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
          ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}
          ${isOver ? 'bg-blue-100 border-blue-400' : ''}
          ${holiday ? 'bg-red-50' : ''}
          ${isSunday && !holiday ? 'bg-red-50' : ''}
          ${isSaturday && !holiday ? 'bg-blue-50' : ''}
          transition-colors duration-200
        `}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`
            text-xs md:text-sm font-medium
            ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
            ${day.isToday ? 'text-blue-600 font-bold' : ''}
            ${holiday ? 'text-red-600' : ''}
            ${isSunday && !holiday ? 'text-red-600' : ''}
            ${isSaturday && !holiday ? 'text-blue-600' : ''}
          `}>
            {viewType === 'day' 
              ? `${day.date.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][day.date.getDay()]})`
              : day.date.getDate()
            }
          </span>
          {holiday && (
            <span className="text-xs text-red-600 font-medium">{holiday}</span>
          )}
        </div>
        {children}
      </div>
    );
  };

  const DraggableTask: React.FC<{ task: Task; children: React.ReactNode }> = ({ task, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: isDragging ? 1000 : 'auto',
    } : undefined;

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        data-task-card="true"
        className={`
          cursor-move p-1 mb-1 rounded text-xs border
          ${getTaskStatusColor(task.status)}
          ${isOverdue(task) ? 'border-red-400 bg-red-50' : ''}
          ${isDragging ? 'opacity-50' : ''}
          hover:shadow-md transition-all duration-200
        `}
        onClick={(e) => {
          e.stopPropagation();
          handleTaskClick(task);
        }}
      >
        {children}
      </div>
    );
  };

  const handleAddTask = () => {
    if (!addTaskTitle.trim() || !addTaskDate) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: addTaskTitle,
      description: addTaskDesc,
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: addTaskDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };
    setCalendarTasks(prev => [...prev, newTask]);
    setAddTaskTitle('');
    setAddTaskDesc('');
    setAddTaskDate(null);
    setShowAddModal(false);
  };

  return (
    <div className="flex-1">
      {/* カレンダーヘッダー - モバイル対応 */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{getViewTitle()}</h2>
          
          {/* ナビゲーション */}
          <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4">
            {/* ビュー切り替え */}
            <div className="flex border rounded-lg overflow-hidden">
              {(['month', 'week', 'day'] as CalendarViewType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`
                    px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium transition-colors
                    ${viewType === type 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {type === 'month' ? '月' : type === 'week' ? '週' : '日'}
                </button>
              ))}
            </div>
            
            {/* 前後ボタン */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handlePrevPeriod}
                className="p-1 md:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                今日
              </button>
              <button
                onClick={handleNextPeriod}
                className="p-1 md:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </div>
        </div>
        
        {/* 期間表示 */}
        <div className="text-lg md:text-xl font-semibold text-gray-700 mt-2 md:mt-0">
          {formatDate(currentDate)}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {/* カレンダーグリッド */}
        <div className={`grid gap-1 md:gap-2 ${
          viewType === 'day' ? 'grid-cols-1' : 'grid-cols-7'
        }`}>
          {/* 曜日ヘッダー - 日ビューでは非表示 */}
          {viewType !== 'day' && ['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div 
              key={day} 
              className={`p-2 text-center text-xs md:text-sm font-medium bg-gray-50 ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
          
          {/* カレンダー日付 */}
          {calendarDays.map((day) => (
            <DroppableDay 
              key={getLocalDateId(day.date)} 
              day={day}
              onClick={(e) => {
                // タスクカードのクリックは除外
                if ((e.target as HTMLElement).closest('[data-task-card]')) return;
                // 「＋表示」のクリックは除外
                if ((e.target as HTMLElement).closest('[data-more-tasks]')) return;
                setAddTaskDate(day.date);
                setAddTaskTitle('');
                setAddTaskDesc('');
                setShowAddModal(true);
              }}
            >
              <div className="space-y-1">
                {day.tasks.slice(0, viewType === 'day' ? 10 : 3).map((task) => (
                  <DraggableTask key={task.id} task={task}>
                    <div className="truncate font-medium">{task.title}</div>
                    <div className="text-xs opacity-75">
                      {typeof task.assignee === 'object' ? task.assignee.name : String(task.assignee)}
                    </div>
                  </DraggableTask>
                ))}
                {day.tasks.length > (viewType === 'day' ? 10 : 3) && (
                  <button
                    data-more-tasks="true"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline text-center py-1 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTasksDay(day);
                    }}
                  >
                    +{day.tasks.length - (viewType === 'day' ? 10 : 3)}件 もっと見る
                  </button>
                )}
              </div>
            </DroppableDay>
          ))}
        </div>
        
        <DragOverlay>
          {activeTask && (
            <div className={`
              p-2 rounded border shadow-lg
              ${getTaskStatusColor(activeTask.status)}
            `}>
              <div className="font-medium text-sm">{activeTask.title}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* タスク詳細モーダル */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* もっと見るモーダル */}
      {showAllTasksDay && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-lg">
                {showAllTasksDay.date.toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </div>
              <button 
                onClick={() => setShowAllTasksDay(null)} 
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {showAllTasksDay.tasks.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  この日のタスクはありません
                </div>
              ) : (
                showAllTasksDay.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`
                      p-3 rounded border cursor-pointer hover:shadow-md transition-all
                      ${getTaskStatusColor(task.status)}
                      ${isOverdue(task) ? 'border-red-400 bg-red-50' : ''}
                    `}
                    onClick={() => { 
                      handleTaskClick(task); 
                      setShowAllTasksDay(null); 
                    }}
                  >
                    <div className="font-medium text-sm mb-1">{task.title}</div>
                    <div className="text-xs text-gray-600 mb-1">
                      担当: {typeof task.assignee === 'object' ? task.assignee.name : String(task.assignee)}
                    </div>
                    <div className="text-xs text-gray-500">
                      期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setAddTaskDate(showAllTasksDay.date);
                  setAddTaskTitle('');
                  setAddTaskDesc('');
                  setShowAddModal(true);
                  setShowAllTasksDay(null);
                }}
                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                この日にタスクを追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新規タスク追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              新規タスク追加
              {addTaskDate && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({addTaskDate.toLocaleDateString('ja-JP')})
                </span>
              )}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={addTaskTitle}
                  onChange={(e) => setAddTaskTitle(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="タスクタイトル"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={addTaskDesc}
                  onChange={(e) => setAddTaskDesc(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="タスクの説明"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期限日</label>
                <input
                  type="date"
                  value={addTaskDate ? addTaskDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setAddTaskDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddTaskDate(null);
                  setAddTaskTitle('');
                  setAddTaskDesc('');
                }}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddTask}
                disabled={!addTaskTitle.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};