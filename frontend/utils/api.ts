const API_BASE_URL = 'https://kobarapide.onrender.com';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  msg?: string;
  message?: string;
}

export const fetchGET = async (endpoint: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' },
    cache: 'no-store'
  });
  const data = await response.json();
  return response.ok
    ? { success: true, data: data.data || data, message: data.msg || data.message }
    : { success: false, error: data.msg || data.message, message: data.msg || data.message };
};

export const fetchPOST = async (endpoint: string, body: any = {}): Promise<ApiResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'POST',
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return response.ok
    ? { success: true, data: data.data || data, message: data.msg || data.message }
    : { success: false, error: data.msg || data.message, message: data.msg || data.message };
};

export const fetchPUT = async (endpoint: string, body: any = {}): Promise<ApiResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'PUT',
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return response.ok
    ? { success: true, data: data.data || data, message: data.msg || data.message }
    : { success: false, error: data.msg || data.message, message: data.msg || data.message };
};

export const fetchDELETE = async (endpoint: string): Promise<ApiResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'DELETE',
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return response.ok
    ? { success: true, data: data.data || data, message: data.msg || data.message }
    : { success: false, error: data.msg || data.message, message: data.msg || data.message };
};

export const isAuthenticated = (): boolean => !!localStorage.getItem('token');

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const getCurrentUser = (): any => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
