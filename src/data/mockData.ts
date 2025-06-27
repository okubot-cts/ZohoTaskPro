import { Task, User, Deal, Customer, KanbanColumn } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: '田中 太郎',
    email: 'tanaka@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    role: 'manager'
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    role: 'sales'
  },
  {
    id: '3',
    name: '鈴木 次郎',
    email: 'suzuki@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    role: 'sales'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '山田 一郎',
    email: 'yamada@company-a.com',
    company: '株式会社A',
    phone: '03-1234-5678'
  },
  {
    id: '2',
    name: '高橋 美咲',
    email: 'takahashi@company-b.com',
    company: '株式会社B',
    phone: '06-8765-4321'
  }
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    name: '株式会社A 新規案件',
    amount: 5000000,
    stage: 'negotiation',
    customer: mockCustomers[0],
    probability: 80
  },
  {
    id: '2',
    name: '株式会社B システム導入',
    amount: 3000000,
    stage: 'proposal',
    customer: mockCustomers[1],
    probability: 60
  }
];

// 現在の日付を基準にしたタスクデータ
const getCurrentDate = () => new Date();
const today = getCurrentDate();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Zoho CRM リード管理機能の実装',
    description: '新規リードの登録・管理機能を実装する。フォームバリデーションとデータベース連携を含む。',
    status: 'todo',
    priority: 'high',
    assignee: '田中 太郎',
    dueDate: today.toISOString().split('T')[0],
    tags: ['開発', 'CRM'],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    title: '顧客データベースの移行作業',
    description: '既存の顧客データを新しいシステムに移行する。データ整合性の確認も含む。',
    status: 'in-progress',
    priority: 'high',
    assignee: '佐藤 花子',
    dueDate: tomorrow.toISOString().split('T')[0],
    tags: ['データ移行', '重要'],
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T10:15:00Z'
  },
  {
    id: '3',
    title: '月次レポートの作成',
    description: '1月の売上・顧客分析レポートを作成し、経営陣に提出する。',
    status: 'review',
    priority: 'medium',
    assignee: '鈴木 次郎',
    dueDate: nextWeek.toISOString().split('T')[0],
    tags: ['レポート', '月次'],
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  },
  {
    id: '4',
    title: 'システム保守・アップデート',
    description: 'サーバーの定期保守とセキュリティアップデートを実施する。',
    status: 'done',
    priority: 'low',
    assignee: '田中 太郎',
    dueDate: lastWeek.toISOString().split('T')[0],
    tags: ['保守', 'セキュリティ'],
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-12T17:30:00Z'
  },
  {
    id: '5',
    title: '新機能のユーザーテスト',
    description: 'リリース予定の新機能についてユーザーテストを実施し、フィードバックを収集する。',
    status: 'todo',
    priority: 'medium',
    assignee: '佐藤 花子',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
    tags: ['テスト', 'ユーザビリティ'],
    createdAt: '2024-01-15T13:20:00Z',
    updatedAt: '2024-01-15T13:20:00Z'
  },
  {
    id: '6',
    title: '営業チーム向けトレーニング',
    description: '新機能の使い方について営業チームにトレーニングを実施する。',
    status: 'in-progress',
    priority: 'medium',
    assignee: '鈴木 次郎',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
    tags: ['トレーニング', '営業'],
    createdAt: '2024-01-13T15:45:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  },
  {
    id: '7',
    title: 'バグ修正：ログイン機能',
    description: '特定の条件下でログインが失敗するバグを修正する。',
    status: 'review',
    priority: 'high',
    assignee: '田中 太郎',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0],
    tags: ['バグ修正', '重要'],
    createdAt: '2024-01-15T08:15:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    id: '8',
    title: 'API ドキュメントの更新',
    description: '新機能に合わせてAPIドキュメントを更新し、開発者向けガイドを作成する。',
    status: 'todo',
    priority: 'low',
    assignee: '佐藤 花子',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString().split('T')[0],
    tags: ['ドキュメント', 'API'],
    createdAt: '2024-01-14T16:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
  },
  {
    id: '9',
    title: 'パフォーマンス最適化',
    description: 'データベースクエリの最適化とキャッシュ機能の改善を実施する。',
    status: 'in-progress',
    priority: 'medium',
    assignee: '鈴木 次郎',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4).toISOString().split('T')[0],
    tags: ['最適化', 'パフォーマンス'],
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-15T11:45:00Z'
  },
  {
    id: '10',
    title: 'セキュリティ監査',
    description: 'システム全体のセキュリティ監査を実施し、脆弱性の有無を確認する。',
    status: 'todo',
    priority: 'high',
    assignee: '田中 太郎',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6).toISOString().split('T')[0],
    tags: ['セキュリティ', '監査'],
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '11',
    title: '顧客サポート対応',
    description: '顧客からの問い合わせに対応し、技術的な問題を解決する。',
    status: 'done',
    priority: 'medium',
    assignee: '佐藤 花子',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString().split('T')[0],
    tags: ['サポート', '顧客対応'],
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T17:00:00Z'
  },
  {
    id: '12',
    title: 'コードレビュー',
    description: 'チームメンバーのプルリクエストをレビューし、コードの品質を確保する。',
    status: 'review',
    priority: 'medium',
    assignee: '鈴木 次郎',
    dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
    tags: ['レビュー', 'コード品質'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T15:30:00Z'
  }
];

export const mockKanbanColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: '未着手',
    tasks: mockTasks.filter(task => task.status === 'todo')
  },
  {
    id: 'in-progress',
    title: '進行中',
    tasks: mockTasks.filter(task => task.status === 'in-progress')
  },
  {
    id: 'review',
    title: 'レビュー中',
    tasks: mockTasks.filter(task => task.status === 'review')
  },
  {
    id: 'done',
    title: '完了',
    tasks: mockTasks.filter(task => task.status === 'done')
  }
]; 