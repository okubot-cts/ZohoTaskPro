import React, { useState } from 'react';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { TaskListView } from './components/TaskListView';
import { AuthTest } from './components/AuthTest';
import { useAuthStore } from './store/authStore';
import { mockKanbanColumns } from './data/mockData';

function App() {
  const [activeView, setActiveView] = useState<'kanban' | 'calendar' | 'list' | 'auth-test'>('kanban');
  const { isAuthenticated } = useAuthStore();

  // 全タスクを取得（カレンダービュー用）
  const allTasks = mockKanbanColumns.flatMap(column => column.tasks);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto p-4">
          {!isAuthenticated && activeView !== 'auth-test' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                  ZohoCRM連携タスク管理ツール
                </h2>
                <p className="text-gray-500 mb-8">
                  Zohoアカウントでログインしてタスク管理を開始してください
                </p>
                <div className="text-sm text-gray-400">
                  右上の「Zohoログイン」ボタンをクリックしてください
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeView === 'kanban' && <KanbanBoard filter={{ overdue: false }} />}
              {activeView === 'calendar' && <CalendarView tasks={allTasks} />}
              {activeView === 'list' && <TaskListView tasks={allTasks} />}
              {activeView === 'auth-test' && <AuthTest />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
