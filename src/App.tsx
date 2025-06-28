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
    </div>
  );
}

export default App;
