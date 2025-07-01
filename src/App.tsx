import React, { useState } from 'react';
import { Header } from './components/Header';
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto p-4">
          {activeView === 'kanban' && <KanbanBoard filter={{ overdue: false }} />}
          {activeView === 'calendar' && <CalendarView tasks={allTasks} />}
          {activeView === 'list' && <TaskListView tasks={allTasks} />}
        </main>
      </div>
    </div>
  );
}

export default App;
