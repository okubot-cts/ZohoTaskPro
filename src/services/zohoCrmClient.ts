import { getZohoConfig } from '../types/env';
import { TokenManager } from '../utils/tokenManager';

export interface ZohoCrmModule {
  api_name: string;
  module_name: string;
  id: string;
}

export interface ZohoCrmRecord {
  id: string;
  [key: string]: any;
}

export interface ZohoCrmResponse<T = any> {
  data: T[];
  info?: {
    count: number;
    page: number;
    per_page: number;
    more_records: boolean;
  };
}

export class ZohoCrmClient {
  private config = getZohoConfig();
  private baseUrl = 'https://www.zohoapis.com/crm/v2';

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = TokenManager.getAccessToken();
    if (!accessToken) {
      throw new Error('Access token not found. Please authenticate first.');
    }

    return {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await TokenManager.refreshTokens();
        if (refreshed) {
          // Retry with new token
          const newHeaders = await this.getAuthHeaders();
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          });
          
          if (!retryResponse.ok) {
            throw new Error(`API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
          }
          
          return retryResponse.json();
        } else {
          throw new Error('Authentication required. Please login again.');
        }
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get available modules
  async getModules(): Promise<ZohoCrmModule[]> {
    const response = await this.request<ZohoCrmResponse<ZohoCrmModule>>('/settings/modules');
    return response.data || [];
  }

  // Get records from a module
  async getRecords(
    module: string,
    options: {
      page?: number;
      per_page?: number;
      sort_order?: 'asc' | 'desc';
      sort_by?: string;
      fields?: string[];
    } = {}
  ): Promise<ZohoCrmResponse<ZohoCrmRecord>> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.per_page) params.append('per_page', options.per_page.toString());
    if (options.sort_order) params.append('sort_order', options.sort_order);
    if (options.sort_by) params.append('sort_by', options.sort_by);
    if (options.fields) params.append('fields', options.fields.join(','));

    const queryString = params.toString();
    const endpoint = `/${module}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ZohoCrmResponse<ZohoCrmRecord>>(endpoint);
  }

  // Get a specific record
  async getRecord(module: string, recordId: string, fields?: string[]): Promise<ZohoCrmRecord | null> {
    const params = fields ? `?fields=${fields.join(',')}` : '';
    const response = await this.request<ZohoCrmResponse<ZohoCrmRecord>>(`/${module}/${recordId}${params}`);
    return response.data?.[0] || null;
  }

  // Create a new record
  async createRecord(module: string, data: Partial<ZohoCrmRecord>): Promise<ZohoCrmRecord> {
    const response = await this.request<ZohoCrmResponse<ZohoCrmRecord>>(`/${module}`, {
      method: 'POST',
      body: JSON.stringify({ data: [data] }),
    });
    
    if (!response.data?.[0]) {
      throw new Error('Failed to create record');
    }
    
    return response.data[0];
  }

  // Update a record
  async updateRecord(module: string, recordId: string, data: Partial<ZohoCrmRecord>): Promise<ZohoCrmRecord> {
    const response = await this.request<ZohoCrmResponse<ZohoCrmRecord>>(`/${module}/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: [data] }),
    });
    
    if (!response.data?.[0]) {
      throw new Error('Failed to update record');
    }
    
    return response.data[0];
  }

  // Delete a record
  async deleteRecord(module: string, recordId: string): Promise<boolean> {
    await this.request(`/${module}/${recordId}`, {
      method: 'DELETE',
    });
    return true;
  }

  // Search records
  async searchRecords(
    module: string,
    criteria: string,
    options: {
      page?: number;
      per_page?: number;
      fields?: string[];
    } = {}
  ): Promise<ZohoCrmResponse<ZohoCrmRecord>> {
    const params = new URLSearchParams();
    params.append('criteria', criteria);
    
    if (options.page) params.append('page', options.page.toString());
    if (options.per_page) params.append('per_page', options.per_page.toString());
    if (options.fields) params.append('fields', options.fields.join(','));

    const endpoint = `/${module}/search?${params.toString()}`;
    return this.request<ZohoCrmResponse<ZohoCrmRecord>>(endpoint);
  }

  // Get tasks (specific for task management)
  async getTasks(options: {
    page?: number;
    per_page?: number;
    status?: string;
    priority?: string;
  } = {}): Promise<ZohoCrmResponse<ZohoCrmRecord>> {
    return this.getRecords('Tasks', {
      ...options,
      fields: [
        'Subject', 'Status', 'Priority', 'Due_Date', 'Description',
        'Owner', 'Created_Time', 'Modified_Time', 'Related_To'
      ],
      sort_by: 'Created_Time',
      sort_order: 'desc',
    });
  }

  // Get deals (for task context)
  async getDeals(options: {
    page?: number;
    per_page?: number;
    stage?: string;
  } = {}): Promise<ZohoCrmResponse<ZohoCrmRecord>> {
    return this.getRecords('Deals', {
      ...options,
      fields: [
        'Deal_Name', 'Stage', 'Amount', 'Closing_Date', 'Account_Name',
        'Owner', 'Created_Time', 'Modified_Time'
      ],
      sort_by: 'Created_Time',
      sort_order: 'desc',
    });
  }

  // Get users
  async getUsers(): Promise<ZohoCrmResponse<ZohoCrmRecord>> {
    return this.request<ZohoCrmResponse<ZohoCrmRecord>>('/users');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getModules();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}