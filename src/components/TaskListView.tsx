import React, { useState } from 'react';
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

  return (
    <div className="p-6">
      {/* 一括操作バー */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 items-center bg-blue-50 p-2 rounded">
          <span>{selected.length}件選択中</span>
          <button className="btn-primary px-2 py-1 rounded" onClick={() => handleBulkStatus('todo')}>一括「未着手」</button>
          <button className="btn-primary px-2 py-1 rounded" onClick={() => handleBulkStatus('in-progress')}>一括「進行中」</button>
          <button className="btn-primary px-2 py-1 rounded" onClick={() => handleBulkStatus('review')}>一括「レビュー中」</button>
          <button className="btn-primary px-2 py-1 rounded" onClick={() => handleBulkStatus('done')}>一括「完了」</button>
          <div className="flex items-center gap-1">
            <input type="date" className="border rounded px-2 py-1" value={bulkDueDate} onChange={e => setBulkDueDate(e.target.value)} />
            <button className="btn-primary px-2 py-1 rounded" onClick={handleBulkDueDate}>一括期限変更</button>
          </div>
          <button className="btn-danger px-2 py-1 rounded" onClick={handleBulkDelete}>一括削除</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="p-2 border-b"><input type="checkbox" checked={selected.length === sorted.length && sorted.length > 0} onChange={toggleSelectAll} /></th>
              {columns.map(col => (
                <th key={col.key} className="p-2 border-b cursor-pointer select-none" onClick={() => handleSort(col.key)}>
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sort.key === col.key && (
                      <span>{sort.order === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
            <tr>
              <th className="p-1 border-b"></th>
              {columns.map(col => (
                <th key={col.key} className="p-1 border-b">{renderFilter(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(task => (
              <tr key={task.id} className={selected.includes(task.id) ? 'bg-blue-50' : ''} onClick={() => handleRowClick(task)} style={{ cursor: 'pointer' }}>
                <td className="p-2 border-b text-center" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.includes(task.id)} onChange={() => toggleSelect(task.id)} /></td>
                <td className="p-2 border-b whitespace-nowrap">{task.title}</td>
                <td className="p-2 border-b">{statusLabels[task.status]}</td>
                <td className="p-2 border-b">{priorityLabels[task.priority]}</td>
                <td className="p-2 border-b">{format(parseISO(task.dueDate), 'yyyy/MM/dd', { locale: ja })}</td>
                <td className="p-2 border-b">{typeof task.assignee === 'object' ? (task.assignee as any).name : String(task.assignee)}</td>
                <td className="p-2 border-b">{task.tags.join(', ')}</td>
                <td className="p-2 border-b">{format(parseISO(task.createdAt), 'yyyy/MM/dd', { locale: ja })}</td>
                <td className="p-2 border-b">{format(parseISO(task.updatedAt), 'yyyy/MM/dd', { locale: ja })}</td>
              </tr>
            ))}
            {/* 新規入力行 */}
            <tr className="bg-blue-50">
              <td className="p-2 border-b text-center"></td>
              <td className="p-2 border-b">
                <input
                  className="w-full border rounded px-1 py-0.5 text-sm"
                  placeholder="タイトル（必須）"
                  value={newTask.title}
                  onChange={e => handleNewTaskChange('title', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newTask.title.trim()) handleAddTask();
                    if (e.key === 'Escape') handleCancelNewTask();
                  }}
                />
              </td>
              <td className="p-2 border-b">
                <select
                  className="w-full border rounded px-1 py-0.5 text-sm"
                  value={newTask.status}
                  onChange={e => handleNewTaskChange('status', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newTask.title.trim()) handleAddTask();
                    if (e.key === 'Escape') handleCancelNewTask();
                  }}
                >
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </td>
              <td className="p-2 border-b">
                <select
                  className="w-full border rounded px-1 py-0.5 text-sm"
                  value={newTask.priority}
                  onChange={e => handleNewTaskChange('priority', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newTask.title.trim()) handleAddTask();
                    if (e.key === 'Escape') handleCancelNewTask();
                  }}
                >
                  {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </td>
              <td className="p-2 border-b">
                <input
                  type="date"
                  className="w-full border rounded px-1 py-0.5 text-sm"
                  value={newTask.dueDate}
                  onChange={e => handleNewTaskChange('dueDate', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newTask.title.trim()) handleAddTask();
                    if (e.key === 'Escape') handleCancelNewTask();
                  }}
                />
              </td>
              <td className="p-2 border-b">
                <input
                  className="w-full border rounded px-1 py-0.5 text-sm"
                  placeholder="担当者"
                  value={newTask.assignee}
                  onChange={e => handleNewTaskChange('assignee', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newTask.title.trim()) handleAddTask();
                    if (e.key === 'Escape') handleCancelNewTask();
                  }}
                />
              </td>
              <td className="p-2 border-b">
                <input
                  className="w-full border rounded px-1 py-0.5 text-sm"
                  placeholder="カンマ区切り"
                  value={newTask.tags}
                  onChange={e => handleNewTaskChange('tags', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newTask.title.trim()) handleAddTask();
                    if (e.key === 'Escape') handleCancelNewTask();
                  }}
                />
              </td>
              <td className="p-2 border-b"></td>
              <td className="p-2 border-b text-xs text-gray-400">Enterで追加 / Escで取消</td>
            </tr>
            {sorted.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="p-4 text-center text-gray-400">該当するタスクがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {modalTask && (
        <TaskDetailModal task={modalTask} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
      {/* 一括操作確認モーダル */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="mb-4 text-lg font-bold text-gray-900">一括操作の確認</div>
            <div className="mb-6 text-gray-700">
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
            <div className="flex justify-end gap-3">
              <button className="btn-secondary px-4 py-2 rounded" onClick={handleCancel}>キャンセル</button>
              <button className="btn-primary px-4 py-2 rounded" onClick={handleConfirm}>実行</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 