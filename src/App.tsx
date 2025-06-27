<<<<<<< HEAD
import React from 'react';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './pages/Dashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { auth } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {auth.isConnected ? <Dashboard /> : <AuthForm />}
=======
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { TaskListView } from './components/TaskListView';
import { mockKanbanColumns } from './data/mockData';

function App() {
  const [activeView, setActiveView] = useState<'kanban' | 'calendar' | 'list'>('kanban');

  // 全タスクを取得（カレンダービュー用）
  const allTasks = mockKanbanColumns.flatMap(column => column.tasks);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {activeView === 'kanban' && <KanbanBoard />}
          {activeView === 'calendar' && <CalendarView tasks={allTasks} />}
          {activeView === 'list' && <TaskListView tasks={allTasks} />}
        </main>
      </div>
>>>>>>> 27514c7 (ローカル作業分の一時コミット)
    </div>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App; 
>>>>>>> 27514c7 (ローカル作業分の一時コミット)
