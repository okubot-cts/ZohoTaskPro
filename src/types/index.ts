<<<<<<< HEAD
import { ReactNode } from 'react';

// API and Authentication Types
export interface ZohoAuth {
  apiKey: string;
  organizationId: string;
  isConnected: boolean;
}

=======
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

>>>>>>> 27514c7 (ローカル作業分の一時コミット)
export interface User {
  id: string;
  name: string;
  email: string;
<<<<<<< HEAD
  profilePicture?: string;
}

export interface RelatedRecord {
  id: string;
  name: string;
  type: 'Deal' | 'Contact' | 'Account' | 'Lead';
  amount?: number;
  stage?: string;
}

export enum TaskStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Waiting = 'Waiting',
  Deferred = 'Deferred',
}

export enum TaskPriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum TaskCategory {
  Development = 'Development',
  Marketing = 'Marketing',
  Sales = 'Sales',
  Support = 'Support',
  Other = 'Other',
}

export interface Task {
  id: string;
  subject: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  description?: string;
  assignedTo?: User;
  createdBy?: User;
  relatedRecord?: RelatedRecord;
  category?: TaskCategory;
  createdTime?: string;
  modifiedTime?: string;
}

// UI State Types
export interface Filter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  dueDate?: {
    from?: string;
    to?: string;
  };
  relatedRecord?: string;
  search?: string;
  onlyMine?: boolean;
}

export enum ViewMode {
  List = 'list',
  Kanban = 'kanban',
  Calendar = 'calendar',
  Gantt = 'gantt',
}

export enum KanbanAxis {
  Status = 'status',
  AssignedTo = 'assignedTo',
  Priority = 'priority',
  DueDate = 'dueDate',
  RelatedRecord = 'relatedRecord',
  Category = 'category',
}

export interface TaskFormData {
  subject: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  description?: string;
  assignedTo?: string;
  relatedRecord?: {
    id: string;
    type: 'Deal' | 'Contact' | 'Account' | 'Lead';
  };
  category?: TaskCategory;
}

export interface SortOption {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

export interface GroupByOption {
  field: keyof Task | 'none';
  label: string;
  icon: ReactNode;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task;
}
=======
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
>>>>>>> 27514c7 (ローカル作業分の一時コミット)
