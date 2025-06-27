import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, CheckCircle, Clock, TrendingUp, Building, Phone, Mail } from 'lucide-react';
import { Task } from '../types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const [editTask, setEditTask] = useState<Task>(task);
  const modalRef = useRef<HTMLDivElement>(null);

  // モーダル外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setEditTask(task);
  }, [task]);

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-600', label: '低' },
    medium: { color: 'bg-blue-100 text-blue-600', label: '中' },
    high: { color: 'bg-orange-100 text-orange-600', label: '高' },
    urgent: { color: 'bg-red-100 text-red-600', label: '緊急' }
  };

  const statusConfig = {
    todo: { color: 'bg-gray-100 text-gray-600', label: '未着手', icon: Clock },
    'in-progress': { color: 'bg-blue-100 text-blue-600', label: '進行中', icon: TrendingUp },
    review: { color: 'bg-yellow-100 text-yellow-600', label: 'レビュー中', icon: Clock },
    done: { color: 'bg-green-100 text-green-600', label: '完了', icon: CheckCircle }
  };

  const priority = priorityConfig[editTask.priority];
  const status = statusConfig[editTask.status];
  const StatusIcon = status.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">タスク詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* タスク基本情報 */}
          <div>
            <input
              className="text-lg font-medium text-gray-900 mb-2 w-full bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400"
              value={editTask.title}
              onChange={e => setEditTask({ ...editTask, title: e.target.value })}
            />
            <textarea
              className="text-gray-600 mb-4 w-full bg-transparent border-b border-gray-100 focus:outline-none focus:border-blue-200 resize-none"
              value={editTask.description || ''}
              onChange={e => setEditTask({ ...editTask, description: e.target.value })}
              rows={2}
              placeholder="説明を入力"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <StatusIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">ステータス:</span>
                <select
                  className={`px-2 py-1 rounded-full text-xs font-medium focus:outline-none ${status.color}`}
                  value={editTask.status}
                  onChange={e => setEditTask({ ...editTask, status: e.target.value as Task['status'] })}
                >
                  <option value="todo">未着手</option>
                  <option value="in-progress">進行中</option>
                  <option value="review">レビュー中</option>
                  <option value="done">完了</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">優先度:</span>
                <select
                  className={`px-2 py-1 rounded-full text-xs font-medium focus:outline-none ${priority.color}`}
                  value={editTask.priority}
                  onChange={e => setEditTask({ ...editTask, priority: e.target.value as Task['priority'] })}
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>
            </div>
          </div>

          {/* 担当者情報 */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">担当者</h4>
            <div className="flex items-center space-x-3">
              {typeof editTask.assignee === 'object' ? (
                <>
                  <img
                    src={(editTask.assignee as any).avatar || 'https://via.placeholder.com/40'}
                    alt={(editTask.assignee as any).name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <input
                      className="font-medium text-gray-900 bg-transparent border-b border-gray-100 focus:outline-none focus:border-blue-200 w-full"
                      value={(editTask.assignee as any).name || ''}
                      onChange={e => setEditTask({ ...editTask, assignee: { ...editTask.assignee as any, name: e.target.value } })}
                    />
                    <input
                      className="text-sm text-gray-600 bg-transparent border-b border-gray-100 focus:outline-none focus:border-blue-200 w-full"
                      value={(editTask.assignee as any).email || ''}
                      onChange={e => setEditTask({ ...editTask, assignee: { ...editTask.assignee as any, email: e.target.value } })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={'https://via.placeholder.com/40'}
                    alt={String(editTask.assignee)}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <input
                      className="font-medium text-gray-900 bg-transparent border-b border-gray-100 focus:outline-none focus:border-blue-200 w-full"
                      value={String(editTask.assignee)}
                      onChange={e => setEditTask({ ...editTask, assignee: e.target.value })}
                    />
                    <input
                      className="text-sm text-gray-600 bg-transparent border-b border-gray-100 focus:outline-none focus:border-blue-200 w-full"
                      value={''}
                      disabled
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 期限情報 */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">期限</h4>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                className="text-gray-900 border-b border-gray-100 focus:outline-none focus:border-blue-200 bg-transparent"
                value={editTask.dueDate.slice(0, 10)}
                onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* 関連商談情報 */}
          {editTask.relatedDeal && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">関連商談</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{editTask.relatedDeal.name}</h5>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      ¥{(editTask.relatedDeal.amount / 10000).toFixed(0)}万
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ステージ:</span>
                    <span className="ml-2 text-gray-900">{editTask.relatedDeal.stage}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">確度:</span>
                    <span className="ml-2 text-gray-900">{editTask.relatedDeal.probability}%</span>
                  </div>
                </div>

                {/* 顧客情報 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h6 className="text-sm font-medium text-gray-900 mb-2">顧客情報</h6>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{editTask.relatedDeal.customer.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{editTask.relatedDeal.customer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{editTask.relatedDeal.customer.email}</span>
                    </div>
                    {editTask.relatedDeal.customer.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{editTask.relatedDeal.customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* タグ */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">タグ</h4>
            <div className="flex flex-wrap gap-2">
              {editTask.tags.map((tag, index) => (
                <input
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 mr-2 mb-2"
                  value={tag}
                  onChange={e => {
                    const newTags = [...editTask.tags];
                    newTags[index] = e.target.value;
                    setEditTask({ ...editTask, tags: newTags });
                  }}
                />
              ))}
              <button
                className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200"
                onClick={() => setEditTask({ ...editTask, tags: [...editTask.tags, ''] })}
                type="button"
              >
                + タグ追加
              </button>
            </div>
          </div>

          {/* 作成・更新日時 */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span>作成日:</span>
                <span className="ml-2">
                  {format(parseISO(editTask.createdAt), 'yyyy/M/d H:mm', { locale: ja })}
                </span>
              </div>
              <div>
                <span>更新日:</span>
                <span className="ml-2">
                  {format(parseISO(editTask.updatedAt), 'yyyy/M/d H:mm', { locale: ja })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}; 