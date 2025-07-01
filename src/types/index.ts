export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string | User;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  relatedDeal?: Deal;
  tags: string[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'manager' | 'sales' | 'viewer';

export interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: DealStage;
  customer: Customer;
  probability: number;
}

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface FilterOptions {
  assignee?: string;
  priority?: Priority;
  dueDate?: 'today' | 'week' | 'month' | 'overdue';
  tags?: string[];
  search?: string;
}

// タスクビューのモード
export enum ViewMode {
  List = 'list',
  Kanban = 'kanban',
  Calendar = 'calendar',
  Gantt = 'gantt',
}


export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  dueDate: string;
  tags?: string[];
  relatedDeal?: string;
}
