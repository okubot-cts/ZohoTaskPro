import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskListViewProps {
  tasks: Task[];
}

const statusLabels: Record<TaskStatus, string> = {
  'todo': '未着手',
  'in-progress': '進行中',
  'review': 'レビュー中',
  'done': '完了',
};
const priorityLabels: Record<Priority, string> = {
  'low': '低',
  'medium': '中',
  'high': '高',
  'urgent': '緊急',
};

const columns = [
  { key: 'title', label: 'タイトル', type: 'text' },
  { key: 'status', label: 'ステータス', type: 'select', options: statusLabels },
  { key: 'priority', label: '優先度', type: 'select', options: priorityLabels },
  { key: 'dueDate', label: '期限', type: 'date' },
  { key: 'assignee', label: '担当者', type: 'text' },
  { key: 'tags', label: 'タグ', type: 'text' },
  { key: 'createdAt', label: '作成日', type: 'date' },
  { key: 'updatedAt', label: '更新日', type: 'date' },
];

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks: initialTasks }) => {
  // ローカルでtasksを管理
  const [tasks, setTasks] = useState(initialTasks);
  // 検索・フィルター
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<null | { type: 'status' | 'dueDate' | 'delete', value?: any }>(null);
  // ソート
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'dueDate', order: 'asc' });
  // 新規タスク入力用state
  const [newTask, setNewTask] = useState({
    title: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    dueDate: '',
    assignee: '',
    tags: '',
  });
  // インライン編集用state
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    title?: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: string;
    assignee?: string;
    tags?: string;
  }>({});
  const newTaskTitleRef = useRef<HTMLInputElement>(null);
  const newTaskRowRef = useRef<HTMLTableRowElement>(null);

  // フィルター適用
  const filtered = tasks.filter(task => {
    return columns.every(col => {
      const val = filters[col.key];
      if (!val) return true;
      if (col.key === 'tags') {
        return task.tags.join(',').includes(val);
      }
      if (col.type === 'text') {
        return String((task as any)[col.key] ?? '').includes(val);
      }
      if (col.type === 'select') {
        return (task as any)[col.key] === val;
      }
      if (col.type === 'date') {
        return ((task as any)[col.key] || '').slice(0, 10) === val;
      }
      return true;
    });
  });

  // ソート適用
  const sorted = [...filtered].sort((a, b) => {
    const { key, order } = sort;
    let av = (a as any)[key];
    let bv = (b as any)[key];
    if (key === 'dueDate' || key === 'createdAt' || key === 'updatedAt') {
      av = av ? new Date(av).getTime() : 0;
      bv = bv ? new Date(bv).getTime() : 0;
    }
    if (typeof av === 'string' && typeof bv === 'string') {
      if (order === 'asc') return av.localeCompare(bv);
      else return bv.localeCompare(av);
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      if (order === 'asc') return av - bv;
      else return bv - av;
    }
    return 0;
  });

  // 一括操作
  const handleBulkStatus = (newStatus: TaskStatus) => setConfirmModal({ type: 'status', value: newStatus });
  const handleBulkDueDate = () => { if (!bulkDueDate) return; setConfirmModal({ type: 'dueDate', value: bulkDueDate }); };
  const handleBulkDelete = () => setConfirmModal({ type: 'delete' });
  const handleConfirm = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'status') {
      alert(`選択タスク(${selected.length}件)を「${statusLabels[confirmModal.value as TaskStatus]}」に変更`);
    } else if (confirmModal.type === 'dueDate') {
      alert(`選択タスク(${selected.length}件)の期限日を${confirmModal.value}に変更`);
      setBulkDueDate('');
    } else if (confirmModal.type === 'delete') {
      alert(`選択タスク(${selected.length}件)を削除`);
    }
    setConfirmModal(null);
  };
  const handleCancel = () => setConfirmModal(null);

  // チェックボックス
  const toggleSelect = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  const toggleSelectAll = () => { if (selected.length === sorted.length) setSelected([]); else setSelected(sorted.map(t => t.id)); };

  // タスク詳細モーダル
  const handleRowClick = (task: Task) => { setModalTask(task); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setModalTask(null); };

  // ソート切り替え
  const handleSort = (key: string) => {
    setSort(prev => prev.key === key ? { key, order: prev.order === 'asc' ? 'desc' : 'asc' } : { key, order: 'asc' });
  };

  // インライン編集機能
  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditingValues({
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate.slice(0, 10),
      assignee: typeof task.assignee === 'object' ? task.assignee.name : String(task.assignee),
      tags: task.tags.join(', '),
    });
  };

  const saveEditing = () => {
    if (!editingTask) return;
    setTasks(prev => prev.map(task => 
      task.id === editingTask 
        ? {
            ...task,
            ...editingValues,
            tags: editingValues.tags ? editingValues.tags.split(',').map(t => t.trim()) : task.tags,
            updatedAt: new Date().toISOString(),
          }
        : task
    ));
    setEditingTask(null);
    setEditingValues({});
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditingValues({});
  };

  // フィルターUI
  const renderFilter = (col: typeof columns[number]) => {
    if (col.type === 'select') {
      return (
        <select className="border rounded px-1 py-0.5 w-full text-xs" value={filters[col.key] || ''} onChange={e => setFilters(f => ({ ...f, [col.key]: e.target.value }))}>
          <option value="">すべて</option>
          {Object.entries(col.options!).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      );
    }
    if (col.type === 'date') {
      return <input type="date" className="border rounded px-1 py-0.5 w-full text-xs" value={filters[col.key] || ''} onChange={e => setFilters(f => ({ ...f, [col.key]: e.target.value }))} />;
    }
    return <input className="border rounded px-1 py-0.5 w-full text-xs" placeholder="検索" value={filters[col.key] || ''} onChange={e => setFilters(f => ({ ...f, [col.key]: e.target.value }))} />;
  };

  // 新規タスク入力用関数
  const handleNewTaskChange = (key: string, value: string) => {
    setNewTask(prev => ({ ...prev, [key]: value }));
  };
  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const now = new Date().toISOString();
    setTasks(prev => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        title: newTask.title,
        description: '',
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate || now.slice(0, 10),
        assignee: newTask.assignee,
        tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()) : [],
        createdAt: now,
        updatedAt: now,
      }
    ]);
    setNewTask({ title: '', status: 'todo', priority: 'medium', dueDate: '', assignee: '', tags: '' });
  };
  const handleCancelNewTask = () => {
    setNewTask({ title: '', status: 'todo', priority: 'medium', dueDate: '', assignee: '', tags: '' });
  };

  // インライン編集用のセル表示
  const renderEditableCell = (task: Task, col: typeof columns[number]) => {
    const isEditing = editingTask === task.id;

    if (isEditing) {
      if (col.key === 'title') {
        return (
          <input
            className="w-full border rounded px-2 py-1 text-xs md:text-sm bg-yellow-50 border-yellow-300"
            value={editingValues.title || ''}
            onChange={(e) => setEditingValues(prev => ({ ...prev, title: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && saveEditing()}
            onKeyDown={(e) => e.key === 'Escape' && cancelEditing()}
            autoFocus
          />
        );
      }
      if (col.key === 'status') {
        return (
          <select
            className="w-full border rounded px-2 py-1 text-xs md:text-sm bg-yellow-50 border-yellow-300"
            value={editingValues.status || task.status}
            onChange={(e) => setEditingValues(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
          >
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        );
      }
      if (col.key === 'priority') {
        return (
          <select
            className="w-full border rounded px-2 py-1 text-xs md:text-sm bg-yellow-50 border-yellow-300"
            value={editingValues.priority || task.priority}
            onChange={(e) => setEditingValues(prev => ({ ...prev, priority: e.target.value as Priority }))}
          >
            {Object.entries(priorityLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        );
      }
      if (col.key === 'dueDate') {
        return (
          <input
            type="date"
            className="w-full border rounded px-2 py-1 text-xs md:text-sm bg-yellow-50 border-yellow-300"
            value={editingValues.dueDate || task.dueDate.slice(0, 10)}
            onChange={(e) => setEditingValues(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        );
      }
      if (col.key === 'assignee') {
        return (
          <input
            className="w-full border rounded px-2 py-1 text-xs md:text-sm bg-yellow-50 border-yellow-300"
            value={editingValues.assignee || ''}
            onChange={(e) => setEditingValues(prev => ({ ...prev, assignee: e.target.value }))}
          />
        );
      }
      if (col.key === 'tags') {
        return (
          <input
            className="w-full border rounded px-2 py-1 text-xs md:text-sm bg-yellow-50 border-yellow-300"
            value={editingValues.tags || ''}
            onChange={(e) => setEditingValues(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="タグ（カンマ区切り）"
          />
        );
      }
    }

    // 通常表示 - クリックで編集開始
    if (col.key === 'title') {
      return (
        <div 
          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
          onClick={() => startEditing(task)}
          title="クリックして編集"
        >
          {task.title}
        </div>
      );
    }
    if (col.key === 'status') {
      return (
        <div 
          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
          onClick={() => startEditing(task)}
          title="クリックして編集"
        >
          <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'done' ? 'bg-green-100 text-green-800' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : task.status === 'review' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
            {statusLabels[task.status]}
          </span>
        </div>
      );
    }
    if (col.key === 'priority') {
      return (
        <div 
          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
          onClick={() => startEditing(task)}
          title="クリックして編集"
        >
          <span className={`px-2 py-1 rounded-full text-xs ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' : task.priority === 'high' ? 'bg-orange-100 text-orange-800' : task.priority === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
            {priorityLabels[task.priority]}
          </span>
        </div>
      );
    }
    if (col.key === 'dueDate') {
      return (
        <div 
          className={`cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors ${new Date() > parseISO(task.dueDate) && task.status !== 'done' ? 'text-red-600 font-medium' : 'text-gray-600'}`}
          onClick={() => startEditing(task)}
          title="クリックして編集"
        >
          {format(parseISO(task.dueDate), 'yyyy/MM/dd', { locale: ja })}
        </div>
      );
    }
    if (col.key === 'assignee') {
      return (
        <div 
          className="text-gray-600 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
          onClick={() => startEditing(task)}
          title="クリックして編集"
        >
          {typeof task.assignee === 'object' ? task.assignee.name : String(task.assignee)}
        </div>
      );
    }
    if (col.key === 'tags') {
      return (
        <div 
          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
          onClick={() => startEditing(task)}
          title="クリックして編集"
        >
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
            )}
          </div>
        </div>
      );
    }
    if (col.key === 'createdAt') {
      return (
        <div className="text-gray-500 px-2 py-1">
          {format(parseISO(task.createdAt), 'yyyy/MM/dd', { locale: ja })}
        </div>
      );
    }
    if (col.key === 'updatedAt') {
      return (
        <div className="text-gray-500 px-2 py-1">
          {format(parseISO(task.updatedAt), 'yyyy/MM/dd', { locale: ja })}
        </div>
      );
    }
    return null;
  };

  // フローティングボタンで新規作成行にスクロール＆フォーカス
  const scrollToNewTaskRow = () => {
    newTaskRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      newTaskTitleRef.current?.focus();
    }, 400); // スクロール後にフォーカス
  };

  return (
    <div className="flex-1 relative">
      {/* 一括操作バー - モバイル対応 */}
      {selected.length > 0 && (
        <div className="mb-4 flex flex-col md:flex-row md:flex-wrap gap-2 items-start md:items-center bg-blue-50 p-3 md:p-2 rounded">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base">{selected.length}件選択中</span>
          </div>
          <div className="flex flex-wrap gap-1 md:gap-2">
            <button className="btn-primary px-2 py-1 rounded text-xs md:text-sm" onClick={() => handleBulkStatus('todo')}>一括「未着手」</button>
            <button className="btn-primary px-2 py-1 rounded text-xs md:text-sm" onClick={() => handleBulkStatus('in-progress')}>一括「進行中」</button>
            <button className="btn-primary px-2 py-1 rounded text-xs md:text-sm" onClick={() => handleBulkStatus('review')}>一括「レビュー中」</button>
            <button className="btn-primary px-2 py-1 rounded text-xs md:text-sm" onClick={() => handleBulkStatus('done')}>一括「完了」</button>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
            <input type="date" className="border rounded px-2 py-1 text-xs md:text-sm" value={bulkDueDate} onChange={e => setBulkDueDate(e.target.value)} />
            <button className="btn-primary px-2 py-1 rounded text-xs md:text-sm" onClick={handleBulkDueDate}>一括期限変更</button>
          </div>
          <button className="btn-danger px-2 py-1 rounded text-xs md:text-sm" onClick={handleBulkDelete}>一括削除</button>
        </div>
      )}
      
      {/* テーブル - モバイルでは横スクロール */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="p-2 border-b"><input type="checkbox" checked={selected.length === sorted.length && sorted.length > 0} onChange={toggleSelectAll} /></th>
              {columns.map(col => (
                <th key={col.key} className="p-2 border-b cursor-pointer select-none" onClick={() => handleSort(col.key)}>
                  <span className="flex items-center gap-1 text-xs md:text-sm">
                    {col.label}
                    {sort.key === col.key && (
                      <span className="text-blue-600">
                        {sort.order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                  {renderFilter(col)}
                </th>
              ))}
              <th className="p-2 border-b text-xs md:text-sm">操作</th>
            </tr>
          </thead>
          <tbody>
            {/* タスク行 */}
            {sorted.map(task => (
              <tr key={task.id} className={`hover:bg-gray-50 ${editingTask === task.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                <td className="p-2 border-b" onClick={e => { e.stopPropagation(); toggleSelect(task.id); }}>
                  <input type="checkbox" checked={selected.includes(task.id)} readOnly />
                </td>
                {columns.map(col => (
                  <td key={col.key} className="p-2 border-b text-xs md:text-sm">
                    {renderEditableCell(task, col)}
                  </td>
                ))}
                <td className="p-2 border-b text-xs md:text-sm">
                  <div className="flex gap-1">
                    <div className="relative group">
                      <button 
                        className="px-2 py-1 border border-gray-300 bg-white rounded shadow-sm hover:bg-gray-100 transition"
                        onClick={() => handleRowClick(task)}
                        aria-label="Expand"
                        tabIndex={0}
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7L3 3m0 0v4m0-4h4m6 6l4 4m0 0h-4m4 0v-4" />
                        </svg>
                      </button>
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap">
                        Expand
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* 新規タスク入力行 - 一番下に配置 */}
            <tr ref={newTaskRowRef} className="bg-blue-50 border-t-2 border-blue-200">
              <td className="p-2 border-b text-center align-middle">
                <svg className="w-5 h-5 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </td>
              {columns.map(col => (
                <td key={col.key} className="p-2 border-b">
                  {col.key === 'title' && (
                    <input
                      ref={newTaskTitleRef}
                      className="w-full border rounded px-2 py-1 text-xs md:text-sm"
                      placeholder="タイトル（必須）"
                      value={newTask.title}
                      onChange={e => handleNewTaskChange('title', e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddTask()}
                    />
                  )}
                  {col.key === 'status' && (
                    <select
                      className="w-full border rounded px-2 py-1 text-xs md:text-sm"
                      value={newTask.status}
                      onChange={e => handleNewTaskChange('status', e.target.value)}
                    >
                      {Object.entries(statusLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  )}
                  {col.key === 'priority' && (
                    <select
                      className="w-full border rounded px-2 py-1 text-xs md:text-sm"
                      value={newTask.priority}
                      onChange={e => handleNewTaskChange('priority', e.target.value)}
                    >
                      {Object.entries(priorityLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  )}
                  {col.key === 'dueDate' && (
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 text-xs md:text-sm"
                      value={newTask.dueDate}
                      onChange={e => handleNewTaskChange('dueDate', e.target.value)}
                    />
                  )}
                  {col.key === 'assignee' && (
                    <input
                      className="w-full border rounded px-2 py-1 text-xs md:text-sm"
                      placeholder="担当者"
                      value={newTask.assignee}
                      onChange={e => handleNewTaskChange('assignee', e.target.value)}
                    />
                  )}
                  {col.key === 'tags' && (
                    <input
                      className="w-full border rounded px-2 py-1 text-xs md:text-sm"
                      placeholder="タグ（カンマ区切り）"
                      value={newTask.tags}
                      onChange={e => handleNewTaskChange('tags', e.target.value)}
                    />
                  )}
                  {col.key === 'createdAt' && (
                    <div className="text-xs text-gray-500">自動設定</div>
                  )}
                  {col.key === 'updatedAt' && (
                    <div className="text-xs text-gray-500">自動設定</div>
                  )}
                </td>
              ))}
              <td className="p-2 border-b text-xs md:text-sm"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* フローティング新規作成ボタン */}
      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={scrollToNewTaskRow}
        aria-label="新規タスク作成行へ移動"
      >
        ＋
      </button>
      
      {modalTask && (
        <TaskDetailModal
          task={modalTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
      
      {/* 一括操作確認モーダル */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-sm">
            <div className="mb-4 text-lg font-bold text-gray-900">一括操作の確認</div>
            <div className="mb-6 text-gray-700 text-sm md:text-base">
              {confirmModal.type === 'status' && (
                <span>選択タスク{selected.length}件を「{statusLabels[confirmModal.value as TaskStatus]}」に変更します。よろしいですか？</span>
              )}
              {confirmModal.type === 'dueDate' && (
                <span>選択タスク{selected.length}件の期限日を{confirmModal.value}に変更します。よろしいですか？</span>
              )}
              {confirmModal.type === 'delete' && (
                <span>選択タスク{selected.length}件を削除します。よろしいですか？</span>
              )}
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-3">
              <button className="btn-secondary px-4 py-2 rounded text-sm md:text-base" onClick={handleCancel}>キャンセル</button>
              <button className="btn-primary px-4 py-2 rounded text-sm md:text-base" onClick={handleConfirm}>実行</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 