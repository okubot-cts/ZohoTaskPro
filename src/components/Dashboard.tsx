import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Calendar,
  BarChart3
} from 'lucide-react';
import { mockTasks, mockUsers } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(task => task.status === 'done').length;
  const overdueTasks = mockTasks.filter(task => 
    new Date() > task.dueDate && task.status !== 'done'
  ).length;
  const inProgressTasks = mockTasks.filter(task => task.status === 'in-progress').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: '総タスク数',
      value: totalTasks,
      icon: BarChart3,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: '完了済み',
      value: completedTasks,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: '進行中',
      value: inProgressTasks,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: '期限切れ',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-3%',
      changeType: 'negative'
    }
  ];

  const recentTasks = mockTasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
        <p className="text-gray-600">タスク管理の全体状況を確認できます</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">先月比</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 完了率チャート */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">タスク完了率</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {completedTasks} / {totalTasks} タスク完了
            </p>
          </div>
        </div>

        {/* 最近のタスク */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近のタスク</h3>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' :
                    task.status === 'review' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.assignee.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {new Date(task.updatedAt).toLocaleDateString('ja-JP')}
                  </p>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    task.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.priority === 'urgent' ? '緊急' :
                     task.priority === 'high' ? '高' :
                     task.priority === 'medium' ? '中' : '低'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* チームメンバー */}
      <div className="mt-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">チームメンバー</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockUsers.map((user) => {
              const userTasks = mockTasks.filter(task => task.assignee.id === user.id);
              const completedUserTasks = userTasks.filter(task => task.status === 'done').length;
              const userCompletionRate = userTasks.length > 0 ? 
                Math.round((completedUserTasks / userTasks.length) * 100) : 0;

              return (
                <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={user.avatar || 'https://via.placeholder.com/40'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${userCompletionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{userCompletionRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 