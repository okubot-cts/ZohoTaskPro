import React from 'react';
import { LayoutGrid, Calendar, List, Search, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  activeView: 'kanban' | 'calendar' | 'list';
  setActiveView: (view: 'kanban' | 'calendar' | 'list') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        {/* ビュー切り替えUI */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'kanban' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveView('kanban')}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden md:inline">カンバン</span>
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'calendar' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveView('calendar')}
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden md:inline">カレンダー</span>
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveView('list')}
          >
            <List className="w-5 h-5" />
            <span className="hidden md:inline">リスト</span>
          </button>
        </div>

        {/* 右側のアイコン・検索・ユーザー部分 */}
        <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-4">
          {/* 検索欄 - モバイルでは幅を調整 */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="タスクを検索..."
              className="w-full md:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-zoho-500 focus:border-transparent"
            />
          </div>

          {/* アイコンボタン群 */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* ユーザー情報 - モバイルでは名前を非表示 */}
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="ユーザー"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">田中 太郎</span>
              <button
                type="button"
                onClick={() => {
                  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                  if (isLocal) {
                    window.location.href = "http://localhost:4000/auth/zoho";
                  } else {
                    // 本番用認証サーバーが未構築の場合はアラート
                    alert('本番環境では認証サーバーがありません。ローカルでお試しください。');
                  }
                }}
                className="text-white bg-[#e74c3c] hover:bg-[#c0392b] flex items-center text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-md ml-2"
              >
                Zohoでログイン
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 