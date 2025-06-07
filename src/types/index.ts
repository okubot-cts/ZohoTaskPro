import { ReactNode } from 'react';

// API and Authentication Types
export interface ZohoAuth {
  apiKey: string;
  organizationId: string;
  isConnected: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
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