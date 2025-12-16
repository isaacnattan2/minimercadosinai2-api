import type { APIResponse, AccessLogsData, UsersData, DeviceStatus, UserCreate } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getStatus: () => fetchAPI<DeviceStatus>('/status'),

  getAccessLogs: () => fetchAPI<APIResponse<AccessLogsData>>('/access-logs'),

  getRecentAccessLogs: (count: number = 10) =>
    fetchAPI<APIResponse<AccessLogsData>>(`/access-logs/recent?count=${count}`),

  getAccessLogsByUser: (userId: number) =>
    fetchAPI<APIResponse<AccessLogsData>>(`/access-logs/by-user/${userId}`),

  getUsers: () => fetchAPI<APIResponse<UsersData>>('/users'),

  getUser: (userId: number) =>
    fetchAPI<APIResponse<{ user: UsersData['users'][0] }>>(`/users/${userId}`),

  createUser: (user: UserCreate) =>
    fetchAPI<APIResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  updateUser: (userId: number, data: Partial<UserCreate>) =>
    fetchAPI<APIResponse>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: number) =>
    fetchAPI<APIResponse>(`/users/${userId}`, {
      method: 'DELETE',
    }),

  openDoor: (doorNumber: number = 1) =>
    fetchAPI<APIResponse>(`/door/open?door_number=${doorNumber}`, {
      method: 'POST',
    }),
};
