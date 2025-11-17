export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'StokTracker';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_BY_BARCODE: (code: string) => `/products/barcode/${code}`,

  // Sales
  SALES: '/sales',
  SALE_BY_ID: (id: string) => `/sales/${id}`,

  // Reports
  DASHBOARD: '/reports/dashboard',
  SALES_BY_PERIOD: '/reports/sales-by-period',
  TOP_PRODUCTS: '/reports/top-products',

  // Health
  HEALTH: '/health'
};

export const STORAGE_KEYS = {
  USER: 'stoktracker_user',
  PRODUCTS: 'stoktracker_products',
  SALES: 'stoktracker_sales',
  SYNC_QUEUE: 'stoktracker_sync_queue',
  OFFLINE_MODE: 'stoktracker_offline_mode'
};

export const DB_NAME = 'StokTrackerDB';
export const DB_VERSION = 1;

export const STORES = {
  PRODUCTS: 'products',
  SALES: 'sales',
  SYNC_QUEUE: 'sync_queue'
};
