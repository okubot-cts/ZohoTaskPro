import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  selected: string[];
  onSelect: (id: string) => void;
  onAddTask: (task: { title: string; description?: string }) => void;
}

const statusColors = {
  todo: 'bg-gray-100 border-gray-200',
  'in-progress': 'bg-blue-100 border-blue-200',
  review: 'bg-yellow-100 border-yellow-200',
  done: 'bg-green-100 border-green-200'
};
const highlightColors = {
  todo: 'bg-blue-50',
  'in-progress': 'bg-blue-100',
  review: 'bg-yellow-50',
  done: 'bg-green-50'
};

export const KanbanColumn: React.FC<KanbanColumnProps & { overColumnId?: string }> = ({ 
  id, 
  title, 
  tasks, 
  onTaskClick, 
  overColumnId = undefined,
  selected,
  onSelect,
  onAddTask
}) => {
  const { setNodeRef } = useDroppable({ id });
  const isActive = overColumnId !== undefined && overColumnId === id;
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const handleSave = () => {
    if (!newTitle.trim()) return;
    onAddTask({ title: newTitle, description: newDesc });
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
  };
  const handleCancel = () => {
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
  };
  return (
    <div ref={setNodeRef} className={`kanban-column flex flex-col flex-1 h-full w-full min-h-screen py-16 transition-colors duration-200 ${isActive ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`} style={{padding: 0, margin: 0}}>
      <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${statusColors[id]}`}>
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
            checked={selected.includes(task.id)}
            onCheck={() => onSelect(task.id)}
          />
        ))}
        {showForm ? (
          <div className="bg-white border border-blue-300 rounded-lg p-3 space-y-2 shadow">
            <input
              className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-400 text-sm mb-1"
              placeholder="タイトル（必須）"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
            />
            <textarea
              className="w-full border-b border-gray-200 focus:outline-none focus:border-blue-200 text-xs mb-1 resize-none"
              placeholder="説明（任意）"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary px-2 py-1 rounded" onClick={handleCancel}>キャンセル</button>
              <button className="btn-primary px-2 py-1 rounded" onClick={handleSave} disabled={!newTitle.trim()}>保存</button>
            </div>
          </div>
        ) : (
          <button className="w-full mt-2 py-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium" onClick={() => setShowForm(true)}>
            ＋ 新規タスク追加
          </button>
        )}
      </div>
    </div>
  );
}; 