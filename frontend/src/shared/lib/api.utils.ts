/**
 * API utilities
 * Handles API calls with offline support
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tarefitas.app';

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('tarefitas_auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: response.statusText,
        code: 'HTTP_ERROR',
        status: response.status,
      };
      throw error;
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // Network error - offline
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        status: 0,
      } as ApiError;
    }
    throw error;
  }
}

export interface SyncResponse {
  tasks: any[];
  lastSyncAt: string;
  conflicts?: any[];
}

export async function syncTasks(localTasks: any[]): Promise<SyncResponse> {
  return apiRequest<SyncResponse>('/sync/tasks', {
    method: 'POST',
    body: JSON.stringify({ tasks: localTasks }),
  });
}

export async function getRemoteTasks(): Promise<any[]> {
  return apiRequest<any[]>('/tasks');
}
