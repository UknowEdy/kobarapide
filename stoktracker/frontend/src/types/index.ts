export interface User {
  id: string;
  name: string;
  phone: string;
  businessName?: string;
  token: string;
}

export interface Product {
  _id: string;
  name: string;
  barcode?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  alertThreshold: number;
  category?: string;
  description?: string;
  image?: string;
  user: string;
  margin?: number;
  marginPercent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  product: string;
  productName: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  items: SaleItem[];
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: 'cash' | 'mobile_money' | 'card' | 'credit';
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  receiptNumber: string;
  user: string;
  saleDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  today: {
    totalRevenue: number;
    totalProfit: number;
    count: number;
  };
  week: {
    totalRevenue: number;
    totalProfit: number;
    count: number;
  };
  month: {
    totalRevenue: number;
    totalProfit: number;
    count: number;
  };
  lowStockCount: number;
  lowStockProducts: Product[];
  stockValue: {
    totalBuyValue: number;
    totalSellValue: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'product' | 'sale';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}
