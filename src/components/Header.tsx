import React, { useEffect } from 'react';
import { LayoutGrid, Calendar, List, Search, Bell, Settings, Shield, LogIn, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  activeView: 'kanban' | 'calendar' | 'list' | 'auth-test';
  setActiveView: (view: 'kanban' | 'calendar' | 'list' | 'auth-test') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const { isAuthenticated, user, isLoading, login, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'auth-test' ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveView('auth-test')}
          >
            <Shield className="w-5 h-5" />
            <span className="hidden md:inline">認証テスト</span>
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

            {/* 認証状態に応じたユーザー情報 */}
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="ログアウト"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Zohoログイン</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 