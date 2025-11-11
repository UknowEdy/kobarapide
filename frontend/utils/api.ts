const API_BASE_URL = 'https://kobarapide.onrender.com';

export const fetchGET = async (endpoint) => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' },
    cache: 'no-store'
  });
  const data = await response.json();
  return response.ok ? { success: true, data: data.data || data } : { success: false, error: data.msg };
};

export const fetchPOST = async (endpoint, body = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'POST',
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return response.ok ? { success: true, data: data.data || data } : { success: false, error: data.msg };
};

export const fetchPUT = async (endpoint, body = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'PUT',
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return response.ok ? { success: true, data: data.data || data } : { success: false, error: data.msg };
};

export const fetchDELETE = async (endpoint) => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE_URL + endpoint, {
    method: 'DELETE',
    headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return response.ok ? { success: true, data: data.data || data } : { success: false, error: data.msg };
};

export const isAuthenticated = () => !!localStorage.getItem('token');

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
