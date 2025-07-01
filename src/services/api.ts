import { Deal, Task, TaskFormData, User } from '../types';
import { ZohoCrmClient, ZohoCrmRecord } from './zohoCrmClient';
import { useAuthStore } from '../store/authStore';

const crmClient = new ZohoCrmClient();

// Helper function to convert Zoho record to Task
const convertZohoRecordToTask = (record: ZohoCrmRecord): Task => {
  return {
    id: record.id,
    title: record.Subject || 'Untitled Task',
    description: record.Description || '',
    status: mapZohoStatusToTaskStatus(record.Status),
    priority: mapZohoPriorityToTaskPriority(record.Priority),
    assignee: record.Owner?.name || 'Unassigned',
    dueDate: record.Due_Date ? new Date(record.Due_Date) : undefined,
    tags: [],
    relatedDeal: record.Related_To?.name || undefined,
    createdAt: new Date(record.Created_Time || Date.now()),
    updatedAt: new Date(record.Modified_Time || Date.now()),
  };
};

// Helper function to convert Task to Zoho record
const convertTaskToZohoRecord = (task: TaskFormData): Partial<ZohoCrmRecord> => {
  return {
    Subject: task.title,
    Description: task.description,
    Status: mapTaskStatusToZoho(task.status),
    Priority: mapTaskPriorityToZoho(task.priority),
    Due_Date: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
    // Owner will be set by Zoho CRM automatically or can be specified
  };
};

// Status mapping functions
const mapZohoStatusToTaskStatus = (zohoStatus: string): 'todo' | 'in-progress' | 'done' => {
  switch (zohoStatus?.toLowerCase()) {
    case 'not started':
    case 'waiting for input':
      return 'todo';
    case 'in progress':
    case 'started':
      return 'in-progress';
    case 'completed':
    case 'closed':
      return 'done';
    default:
      return 'todo';
  }
};

const mapTaskStatusToZoho = (status: string): string => {
  switch (status) {
    case 'todo':
      return 'Not Started';
    case 'in-progress':
      return 'In Progress';
    case 'done':
      return 'Completed';
    default:
      return 'Not Started';
  }
};

const mapZohoPriorityToTaskPriority = (zohoPriority: string): 'low' | 'medium' | 'high' => {
  switch (zohoPriority?.toLowerCase()) {
    case 'highest':
    case 'high':
      return 'high';
    case 'normal':
    case 'medium':
      return 'medium';
    case 'low':
    case 'lowest':
      return 'low';
    default:
      return 'medium';
  }
};

const mapTaskPriorityToZoho = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Normal';
    case 'low':
      return 'Low';
    default:
      return 'Normal';
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    return await crmClient.testConnection();
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await crmClient.getTasks({ per_page: 200 });
    return response.data.map(convertZohoRecordToTask);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    // Return empty array on error to prevent app crash
    return [];
  }
};

export const fetchTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    const record = await crmClient.getRecord('Tasks', taskId);
    return record ? convertZohoRecordToTask(record) : null;
  } catch (error) {
    console.error('Failed to fetch task by ID:', error);
    return null;
  }
};

export const createTask = async (taskData: TaskFormData): Promise<Task | null> => {
  try {
    const zohoRecord = convertTaskToZohoRecord(taskData);
    const createdRecord = await crmClient.createRecord('Tasks', zohoRecord);
    return convertZohoRecordToTask(createdRecord);
  } catch (error) {
    console.error('Failed to create task:', error);
    return null;
  }
};

export const updateTask = async (taskId: string, taskData: Partial<TaskFormData>): Promise<Task | null> => {
  try {
    const zohoRecord = convertTaskToZohoRecord(taskData as TaskFormData);
    const updatedRecord = await crmClient.updateRecord('Tasks', taskId, zohoRecord);
    return convertZohoRecordToTask(updatedRecord);
  } catch (error) {
    console.error('Failed to update task:', error);
    return null;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    return await crmClient.deleteRecord('Tasks', taskId);
  } catch (error) {
    console.error('Failed to delete task:', error);
    return false;
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await crmClient.getUsers();
    return response.data.map((record: ZohoCrmRecord) => ({
      id: record.id,
      name: record.full_name || record.name || 'Unknown User',
      email: record.email || '',
      avatar: record.profile?.image_link,
    }));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

export const fetchDeals = async (): Promise<Deal[]> => {
  try {
    const response = await crmClient.getDeals({ per_page: 200 });
    return response.data.map((record: ZohoCrmRecord) => ({
      id: record.id,
      name: record.Deal_Name || 'Untitled Deal',
      stage: record.Stage || 'Unknown',
      amount: record.Amount || 0,
      closeDate: record.Closing_Date ? new Date(record.Closing_Date) : new Date(),
      accountName: record.Account_Name?.name || 'Unknown Account',
      owner: record.Owner?.name || 'Unassigned',
      createdAt: new Date(record.Created_Time || Date.now()),
    }));
  } catch (error) {
    console.error('Failed to fetch deals:', error);
    return [];
  }
};