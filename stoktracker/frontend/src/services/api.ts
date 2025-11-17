import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/config/api';
import { User, Product, Sale, DashboardStats, ApiResponse } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token
    this.api.interceptors.request.use(
      (config) => {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          const user: User = JSON.parse(userStr);
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expiré, déconnecter l'utilisateur
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // AUTH
  async login(phone: string, pin: string): Promise<ApiResponse<User>> {
    const { data } = await this.api.post(API_ENDPOINTS.LOGIN, { phone, pin });
    return data;
  }

  async register(userData: {
    name: string;
    phone: string;
    pin: string;
    businessName?: string;
  }): Promise<ApiResponse<User>> {
    const { data } = await this.api.post(API_ENDPOINTS.REGISTER, userData);
    return data;
  }

  // PRODUCTS
  async getProducts(params?: { search?: string; lowStock?: boolean }): Promise<ApiResponse<Product[]>> {
    const { data } = await this.api.get(API_ENDPOINTS.PRODUCTS, { params });
    return data;
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const { data } = await this.api.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return data;
  }

  async getProductByBarcode(code: string): Promise<ApiResponse<Product>> {
    const { data } = await this.api.get(API_ENDPOINTS.PRODUCT_BY_BARCODE(code));
    return data;
  }

  async createProduct(product: Partial<Product>): Promise<ApiResponse<Product>> {
    const { data } = await this.api.post(API_ENDPOINTS.PRODUCTS, product);
    return data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    const { data } = await this.api.put(API_ENDPOINTS.PRODUCT_BY_ID(id), product);
    return data;
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return data;
  }

  // SALES
  async getSales(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<Sale[]>> {
    const { data } = await this.api.get(API_ENDPOINTS.SALES, { params });
    return data;
  }

  async getSaleById(id: string): Promise<ApiResponse<Sale>> {
    const { data } = await this.api.get(API_ENDPOINTS.SALE_BY_ID(id));
    return data;
  }

  async createSale(sale: {
    items: Array<{ product: string; quantity: number }>;
    paymentMethod?: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<ApiResponse<Sale>> {
    const { data } = await this.api.post(API_ENDPOINTS.SALES, sale);
    return data;
  }

  async deleteSale(id: string): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete(API_ENDPOINTS.SALE_BY_ID(id));
    return data;
  }

  // REPORTS
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await this.api.get(API_ENDPOINTS.DASHBOARD);
    return data;
  }

  async getSalesByPeriod(period: 'week' | 'month' | 'year'): Promise<ApiResponse<any[]>> {
    const { data } = await this.api.get(API_ENDPOINTS.SALES_BY_PERIOD, {
      params: { period }
    });
    return data;
  }

  async getTopProducts(limit = 10): Promise<ApiResponse<any[]>> {
    const { data } = await this.api.get(API_ENDPOINTS.TOP_PRODUCTS, {
      params: { limit }
    });
    return data;
  }

  // HEALTH CHECK
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get(API_ENDPOINTS.HEALTH);
      return true;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
