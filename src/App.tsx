import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { TaskListView } from './components/TaskListView';
import { AuthForm } from './components/auth/AuthForm';
import { mockKanbanColumns } from './data/mockData';
import { fetchZohoAccessToken } from './services/api';
import { useAuthStore } from './store/authStore';

function App() {
  const [activeView, setActiveView] = useState<'kanban' | 'calendar' | 'list'>('kanban');
  const { auth, setAuth, isAuthenticated } = useAuthStore();

  // 全タスクを取得（カレンダービュー用）
  const allTasks = mockKanbanColumns.flatMap(column => column.tasks);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      // アクセストークン取得
      fetchZohoAccessToken(code)
        .then(tokenData => {
          console.log('アクセストークン取得成功:', tokenData);
          setAuth(tokenData);
          // URLからコードパラメータを削除
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(err => {
          console.error('トークン取得エラー:', err);
          alert('トークン取得エラー: ' + err.message);
        });
    }
  }, [setAuth]);

  // 一時的に認証画面をスキップ
  // if (!isAuthenticated()) {
  //   return <AuthForm />;
  // }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー削除 */}
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeView === 'kanban' && <KanbanBoard filter={{ overdue: false }} />}
          {activeView === 'calendar' && <CalendarView tasks={allTasks} />}
          {activeView === 'list' && <TaskListView tasks={allTasks} />}
        </main>
      </div>
    </div>
  );
}

export default App;
