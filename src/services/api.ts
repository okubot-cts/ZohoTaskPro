import axios from 'axios';
import { Deal, Task, TaskFormData, User, ZohoAuth } from '../types';

// Create axios instance with base configuration
const createApiClient = (auth: ZohoAuth) => {
  const client = axios.create({
    baseURL: '/zoho-api/crm/v2',
    headers: {
      'Authorization': `Bearer ${auth.apiKey}`,
      'Content-Type': 'application/json',
    },
    params: {
      organization_id: auth.organizationId,
    },
  });
  
  return client;
};

// Test connection to Zoho CRM API
export const testConnection = async (auth: ZohoAuth): Promise<boolean> => {
  try {
    // For demo purposes, accept any non-empty values
    if (auth.apiKey.trim() && auth.organizationId.trim()) {
      return true;
    }
    throw new Error('API Key and Organization ID are required');
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  }
};

// Get all tasks
export const fetchTasks = async (auth: ZohoAuth): Promise<Task[]> => {
  try {
    const client = createApiClient(auth);
    const response = await client.get('/tasks');
    return transformTasksResponse(response.data.data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks from Zoho CRM');
  }
};

// Get a single task by ID
export const fetchTaskById = async (auth: ZohoAuth, taskId: string): Promise<Task> => {
  try {
    const client = createApiClient(auth);
    const response = await client.get(`/tasks/${taskId}`);
    return transformTaskResponse(response.data.data[0]);
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw new Error(`Failed to fetch task ${taskId} from Zoho CRM`);
  }
};

// Create a new task
export const createTask = async (auth: ZohoAuth, taskData: TaskFormData): Promise<Task> => {
  try {
    const client = createApiClient(auth);
    const payload = transformTaskForZoho(taskData);
    const response = await client.post('/tasks', { data: [payload] });
    return fetchTaskById(auth, response.data.data[0].details.id);
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task in Zoho CRM');
  }
};

// Update a task
export const updateTask = async (auth: ZohoAuth, taskId: string, taskData: Partial<TaskFormData>): Promise<Task> => {
  try {
    const client = createApiClient(auth);
    const payload = transformTaskForZoho(taskData);
    await client.put(`/tasks/${taskId}`, { data: [payload] });
    return fetchTaskById(auth, taskId);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw new Error(`Failed to update task ${taskId} in Zoho CRM`);
  }
};

// Delete a task
export const deleteTask = async (auth: ZohoAuth, taskId: string): Promise<boolean> => {
  try {
    const client = createApiClient(auth);
    await client.delete(`/tasks/${taskId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw new Error(`Failed to delete task ${taskId} from Zoho CRM`);
  }
};

// Fetch users
export const fetchUsers = async (auth: ZohoAuth): Promise<User[]> => {
  try {
    const client = createApiClient(auth);
    const response = await client.get('/users');
    return response.data.data.map((user: any) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      profilePicture: user.profile_picture,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users from Zoho CRM');
  }
};

// Fetch deals
export const fetchDeals = async (auth: ZohoAuth): Promise<Deal[]> => {
  try {
    const client = createApiClient(auth);
    const response = await client.get('/deals');
    return response.data.data.map((deal: any) => ({
      id: deal.id,
      name: deal.Deal_Name,
      stage: deal.Stage,
      amount: deal.Amount,
      closingDate: deal.Closing_Date,
      probability: deal.Probability,
    }));
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw new Error('Failed to fetch deals from Zoho CRM');
  }
};

// Helper functions for data transformation
const transformTasksResponse = (data: any[]): Task[] => {
  return data.map(transformTaskResponse);
};

const transformTaskResponse = (data: any): Task => {
  return {
    id: data.id,
    subject: data.Subject,
    status: data.Status,
    priority: data.Priority,
    dueDate: data.Due_Date,
    description: data.Description,
    assignedTo: data.Owner ? {
      id: data.Owner.id,
      name: data.Owner.name,
      email: data.Owner.email,
    } : undefined,
    relatedDeal: data.What_Id ? {
      id: data.What_Id.id,
      name: data.What_Id.name,
      stage: data.What_Id.Stage,
      amount: data.What_Id.Amount,
    } : undefined,
    createdTime: data.Created_Time,
    modifiedTime: data.Modified_Time,
  };
};

const transformTaskForZoho = (taskData: Partial<TaskFormData>): any => {
  const zohoTask: any = {};
  
  if (taskData.subject) zohoTask.Subject = taskData.subject;
  if (taskData.status) zohoTask.Status = taskData.status;
  if (taskData.priority) zohoTask.Priority = taskData.priority;
  if (taskData.dueDate) zohoTask.Due_Date = taskData.dueDate;
  if (taskData.description) zohoTask.Description = taskData.description;
  
  if (taskData.assignedTo) {
    zohoTask.Owner = {
      id: taskData.assignedTo,
    };
  }
  
  if (taskData.relatedDeal) {
    zohoTask.What_Id = {
      id: taskData.relatedDeal,
    };
  }
  
  return zohoTask;
};