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
      setOverDateId(over.id);
    }
    // overがnullでも、最後のoverDateIdは保持
  };

  // ドラッグ開始時にactiveTaskをセット
  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active && active.id) {
      const task = calendarTasks.find(t => String(t.id) === String(active.id));
      setActiveTask(task || null);
    }
  };

  // 日付セルのラッパー
  interface DroppableDayProps {
    day: CalendarDay;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    style?: React.CSSProperties;
  }
  const DroppableDay: React.FC<DroppableDayProps> = ({ day, children, onClick, style }) => {
    const id = getLocalDateId(day.date);
    const { setNodeRef, isOver } = useDroppable({ id });
    const isActive = isOver || overDateId === id;
    // 曜日・祝日色分け
    const wday = day.date.getDay();
    const holidayName = getHoliday(day.date);
    const isSunday = wday === 0;
    const isSaturday = wday === 6;
    const isHoliday = !!holidayName;
    return (
      <div
        ref={setNodeRef}
        className={
          `${viewType === 'day' ? 'min-h-[400px]' : viewType === 'week' ? 'min-h-[200px]' : viewType === 'month' ? 'min-h-[150px]' : 'min-h-[120px]'}
          p-2 border border-gray-200 rounded-lg
          ${!day.isCurrentMonth && viewType === 'month' ? 'bg-gray-50' : isHoliday ? 'bg-red-50' : 'bg-white'}
          ${day.isToday ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''}
          ${isActive ? 'bg-blue-200 ring-4 ring-blue-400' : ''}
          hover:bg-gray-50 transition-colors relative`
        }
        onClick={onClick}
        style={style}
      >
        {/* 今日バッジ */}
        {day.isToday && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow">今日</span>
        )}
        {/* 祝日名表示 */}
        {isHoliday && (
          <span className="absolute top-2 left-2 text-xs text-red-500 font-bold" title={holidayName}>{holidayName}</span>
        )}
        {Array.isArray(children)
          ? (
              <>
                {React.isValidElement(children[0])
                  ? React.cloneElement(children[0] as any, {
                      style: {
                        ...(isHoliday ? { color: '#e53e3e' } : isSunday ? { color: '#e53e3e' } : isSaturday ? { color: '#3182ce' } : {}),
                        ...(children[0] as any).props?.style || {}
                      }
                    })
                  : children[0]}
                {children.slice(1)}
              </>
            )
          : children}
      </div>
    );
  };

  // タスクカードのラッパー
  const DraggableTask: React.FC<{ task: Task; children: React.ReactNode }> = ({ task, children }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: String(task.id) });
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {children}
      </div>
    );
  };

  // モーダル外クリック・Escで閉じる
  React.useEffect(() => {
    if (!showAddModal) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('calendar-add-modal-bg')) {
        setShowAddModal(false);
        setAddTaskDate(null);
        setAddTaskTitle('');
        setAddTaskDesc('');
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setAddTaskDate(null);
        setAddTaskTitle('');
        setAddTaskDesc('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showAddModal]);

  const handleAddTask = () => {
    if (!addTaskTitle.trim() || !addTaskDate) return;
    const now = new Date().toISOString();
    setCalendarTasks(prev => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        title: addTaskTitle,
        description: addTaskDesc,
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: addTaskDate.toISOString().slice(0, 10),
        createdAt: now,
        updatedAt: now,
        tags: [],
      }
    ]);
    setShowAddModal(false);
    setAddTaskDate(null);
    setAddTaskTitle('');
    setAddTaskDesc('');
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getViewTitle()}</h2>
        <p className="text-gray-600">タスクの期限をカレンダーで確認できます</p>
      </div>

      {/* ビュー切り替えボタン */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewType === 'month'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            月
          </button>
          <button
            onClick={() => setViewType('week')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewType === 'week'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            週
          </button>
          <button
            onClick={() => setViewType('day')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewType === 'day'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            日
          </button>
        </div>
      </div>

      {/* カレンダー上部：年月表示と前月/次月ボタン */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevPeriod} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors">今日</button>
          <button onClick={handleNextPeriod} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
          {formatDate(currentDate)}
        </h3>
        <div style={{width: 40}} /> {/* 右側のスペース調整 */}
      </div>

      {/* DndContextでカレンダー本体をラップ */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {/* 曜日ヘッダー */}
        {viewType === 'day' ? (
          <div className="grid grid-cols-1 gap-4 mb-2">
            <div className="text-center text-sm font-medium text-gray-500">
              {calendarDays[0].date.toLocaleDateString('ja-JP', { weekday: 'long' })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4 mb-2">
            {["日", "月", "火", "水", "木", "金", "土"].map((wday) => (
              <div key={wday} className="text-center text-sm font-medium text-gray-500">{wday}</div>
            ))}
          </div>
        )}
        <div className={viewType === 'day' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-7 gap-4'}>
          {calendarDays.map((day, index) => (
            <DroppableDay
              key={index}
              day={day}
              // 日付セルの空白領域クリックで新規登録モーダル
              onClick={e => {
                // タスクカードやもっと見るボタンのクリックは除外
                if ((e.target as HTMLElement).closest('.calendar-task-card') || (e.target as HTMLElement).closest('.calendar-more-btn')) return;
                setAddTaskDate(day.date);
                setAddTaskTitle('');
                setAddTaskDesc('');
                setShowAddModal(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* 日付（数字）表示 */}
              <div className={`text-xs font-bold mb-1 ${!day.isCurrentMonth && viewType === 'month' ? 'text-gray-300' : 'text-gray-700'}`}>
                {day.isCurrentMonth ? day.date.getDate() : `${day.date.getMonth() + 1}/${day.date.getDate()}`}
              </div>
              {/* タスクカード表示 */}
              <div className="space-y-1">
                {day.tasks.slice(0, 5).map((task, taskIndex) => (
                  <DraggableTask key={task.id} task={task}>
                    <div
                      onClick={e => { e.stopPropagation(); handleTaskClick(task); }}
                      className={`calendar-task-card p-1 text-xs rounded border cursor-pointer ${getTaskStatusColor(task.status)} ${isOverdue(task) ? 'bg-red-100 text-red-800 border-red-200' : ''} hover:opacity-80 transition-opacity`}
                      title={task.title}
                    >
                      <div className="truncate">{task.title}</div>
                    </div>
                  </DraggableTask>
                ))}
                {day.tasks.length > 5 && (
                  <button
                    className="calendar-more-btn w-full text-xs text-blue-600 hover:underline mt-1"
                    onClick={e => { e.stopPropagation(); setShowAllTasksDay(day); }}
                  >
                    +{day.tasks.length - 5}件 もっと見る
                  </button>
                )}
              </div>
            </DroppableDay>
          ))}
        </div>
        {/* DragOverlay */}
        <DragOverlay>
          {activeTask && (
            <div className={`p-1 text-xs rounded border cursor-pointer ${getTaskStatusColor(activeTask.status)} ${isOverdue(activeTask) ? 'bg-red-100 text-red-800 border-red-200' : ''} shadow-lg min-w-[120px]`}>
              <div className="truncate">{activeTask.title}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* もっと見るモーダル */}
      {showAllTasksDay && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-lg">
                {showAllTasksDay.date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </div>
              <button onClick={() => setShowAllTasksDay(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="space-y-2">
              {showAllTasksDay.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 text-xs rounded border cursor-pointer ${getTaskStatusColor(task.status)} ${isOverdue(task) ? 'bg-red-100 text-red-800 border-red-200' : ''} hover:opacity-80 transition-opacity`}
                  title={task.title}
                  onClick={() => { handleTaskClick(task); setShowAllTasksDay(null); }}
                >
                  <div className="truncate font-bold">{task.title}</div>
                  <div className="text-gray-500 mt-1">担当: {typeof task.assignee === 'object' ? (task.assignee as any).name : String(task.assignee)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* タスク詳細モーダル（カンバンと共通） */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
      {/* 新規タスク追加モーダル */}
      {showAddModal && addTaskDate && (
        <div className="calendar-add-modal-bg fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="mb-4 text-lg font-bold text-gray-900">新規タスク追加（{addTaskDate.toLocaleDateString('ja-JP') }）</div>
            <input
              className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-400 text-base mb-3 px-1"
              placeholder="タイトル（必須）"
              value={addTaskTitle}
              onChange={e => setAddTaskTitle(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && addTaskTitle.trim()) handleAddTask();
                if (e.key === 'Escape') { setShowAddModal(false); setAddTaskDate(null); setAddTaskTitle(''); setAddTaskDesc(''); }
              }}
            />
            <textarea
              className="w-full border-b border-gray-200 focus:outline-none focus:border-blue-200 text-sm mb-3 px-1 resize-none"
              placeholder="説明（任意）"
              value={addTaskDesc}
              onChange={e => setAddTaskDesc(e.target.value)}
              rows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && addTaskTitle.trim()) handleAddTask();
                if (e.key === 'Escape') { setShowAddModal(false); setAddTaskDate(null); setAddTaskTitle(''); setAddTaskDesc(''); }
              }}
            />
            <div className="flex gap-2 justify-end mt-2">
              <button className="btn-secondary px-4 py-2 rounded" onClick={() => { setShowAddModal(false); setAddTaskDate(null); setAddTaskTitle(''); setAddTaskDesc(''); }}>キャンセル</button>
              <button className="btn-primary px-4 py-2 rounded" onClick={handleAddTask} disabled={!addTaskTitle.trim()}>追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};