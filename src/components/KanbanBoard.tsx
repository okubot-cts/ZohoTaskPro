import React, { useState } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from './TaskDetailModal';
import { Task, TaskStatus, KanbanColumn as KanbanColumnType } from '../types';
import { mockKanbanColumns } from '../data/mockData';
import { TaskCard } from './TaskCard';

const COLUMN_IDS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
const statusLabels: Record<TaskStatus, string> = {
  'todo': '未着手',
  'in-progress': '進行中',
  'review': 'レビュー中',
  'done': '完了',
};

export const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<KanbanColumnType[]>(mockKanbanColumns);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | undefined>(undefined);
  // 一括選択・一括操作
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [confirmModal, setConfirmModal] = useState<null | { type: 'status' | 'dueDate' | 'delete', value?: any }>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // タスクIDからカラムを特定
  const findColumnByTaskId = (taskId: string) => {
    return columns.find((col) => col.tasks.some((task) => task.id === taskId));
  };

  // カラムIDからカラムを特定
  const findColumnById = (colId: string) => {
    return columns.find((col) => col.id === colId);
  };

  const getTaskById = (taskId: string): Task | undefined => {
    for (const col of columns) {
      const found = col.tasks.find((task) => task.id === taskId);
      if (found) return found;
    }
    return undefined;
  };

  const handleDragStart = (event: any) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    if (!over || active.id === over.id) return;

    const activeTaskId = active.id as string;
    let overId = over.id as string;

    // ドロップ先がカラムIDかタスクIDか判定
    let toColumn = findColumnById(overId);
    let toIndex = 0;
    if (!toColumn) {
      // タスクIDの場合、そのタスクが属するカラムを取得
      toColumn = findColumnByTaskId(overId);
      if (!toColumn) return;
      toIndex = toColumn.tasks.findIndex((task) => task.id === overId);
    } else {
      // カラム自体にドロップした場合は末尾
      toIndex = toColumn.tasks.length;
    }

    const fromColumn = findColumnByTaskId(activeTaskId);
    if (!fromColumn || !toColumn) return;
    const fromIndex = fromColumn.tasks.findIndex((task) => task.id === activeTaskId);
    if (fromIndex === -1) return;

    // 同じカラム内の並び替え
    if (fromColumn.id === toColumn.id) {
      const newTasks = arrayMove(fromColumn.tasks, fromIndex, toIndex);
      setColumns((prev) =>
        prev.map((col) =>
          col.id === fromColumn.id ? { ...col, tasks: newTasks } : col
        )
      );
    } else {
      // カラム間移動
      const movedTask = { ...fromColumn.tasks[fromIndex], status: toColumn.id };
      const newFromTasks = [...fromColumn.tasks];
      newFromTasks.splice(fromIndex, 1);
      const newToTasks = [...toColumn.tasks];
      newToTasks.splice(toIndex, 0, movedTask);
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === fromColumn.id) return { ...col, tasks: newFromTasks };
          if (col.id === toColumn.id) return { ...col, tasks: newToTasks };
          return col;
        })
      );
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over && over.id) {
      let columnId = null;
      if (COLUMN_IDS.includes(over.id)) {
        columnId = over.id;
      } else {
        // カードidの場合、そのカードが属するカラムidを探す
        for (const column of columns) {
          if (column.tasks.some(task => task.id === over.id)) {
            columnId = column.id;
            break;
          }
        }
      }
      setOverColumnId(columnId ?? undefined);
    } else {
      setOverColumnId(undefined);
    }
  };

  // チェックボックス
  const toggleSelect = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  const toggleSelectAll = () => {
    const allTaskIds = columns.flatMap(col => col.tasks.map(t => t.id));
    if (selected.length === allTaskIds.length) setSelected([]);
    else setSelected(allTaskIds);
  };

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

  // 新規タスク追加
  const handleAddTask = (columnId: TaskStatus, { title, description }: { title: string; description?: string }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: columnId,
      priority: 'medium',
      assignee: '',
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
    ));
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">タスク管理</h2>
        <p className="text-gray-600">ドラッグ&ドロップでタスクのステータスを変更できます</p>
      </div>
      {/* 一括操作バー */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 items-center bg-blue-50 p-2 rounded">
          <input type="checkbox" checked={selected.length === columns.flatMap(col => col.tasks).length && columns.flatMap(col => col.tasks).length > 0} onChange={toggleSelectAll} />
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
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <SortableContext
              key={column.id}
              id={column.id}
              items={column.tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                tasks={column.tasks}
                onTaskClick={handleTaskClick}
                overColumnId={overColumnId}
                selected={selected}
                onSelect={toggleSelect}
                onAddTask={(task) => handleAddTask(column.id, task)}
              />
            </SortableContext>
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeTaskId ? (
            <TaskCard task={getTaskById(activeTaskId)!} />
          ) : null}
        </DragOverlay>
      </DndContext>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
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