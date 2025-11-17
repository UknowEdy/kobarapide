import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, CartItem } from '@/types';
import api from '@/services/api';
import syncService from '@/services/sync';
import {
  getProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  getSalesFromDB,
  saveSaleToDB,
  addToSyncQueue
} from '@/services/db';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  // Produits
  products: Product[];
  loadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Ventes
  sales: Sale[];
  loadingSales: boolean;
  refreshSales: () => Promise<void>;
  createSale: (sale: any) => Promise<void>;

  // Panier
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Synchronisation
  isOnline: boolean;
  pendingSync: number;
  manualSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  // Surveiller le statut réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncService.syncAll();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mettre à jour le statut de synchronisation
  useEffect(() => {
    const updateSyncStatus = async () => {
      const status = await syncService.getSyncStatus();
      setIsOnline(status.online);
      setPendingSync(status.pendingItems);
    };

    const interval = setInterval(updateSyncStatus, 5000);
    updateSyncStatus();

    return () => clearInterval(interval);
  }, []);

  // Charger les produits
  const refreshProducts = async () => {
    setLoadingProducts(true);
    try {
      if (isOnline) {
        const response = await api.getProducts();
        if (response.success && response.data) {
          setProducts(response.data);
          // Sauvegarder en local
          for (const product of response.data) {
            await saveProductToDB(product);
          }
        }
      } else {
        // Mode hors ligne - charger depuis IndexedDB
        const localProducts = await getProductsFromDB();
        setProducts(localProducts);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // Fallback sur les données locales
      const localProducts = await getProductsFromDB();
      setProducts(localProducts);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Ajouter un produit
  const addProduct = async (productData: Partial<Product>) => {
    try {
      if (isOnline) {
        const response = await api.createProduct(productData);
        if (response.success && response.data) {
          await saveProductToDB(response.data);
          await refreshProducts();
        }
      } else {
        // Mode hors ligne
        const tempProduct: Product = {
          ...productData,
          _id: `temp_${uuidv4()}`,
          user: 'temp',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Product;

        await saveProductToDB(tempProduct);
        await addToSyncQueue({
          id: uuidv4(),
          type: 'product',
          action: 'create',
          data: productData,
          timestamp: Date.now(),
          synced: false
        });
        await refreshProducts();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      throw error;
    }
  };

  // Mettre à jour un produit
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      if (isOnline) {
        const response = await api.updateProduct(id, productData);
        if (response.success && response.data) {
          await saveProductToDB(response.data);
          await refreshProducts();
        }
      } else {
        // Mode hors ligne
        await addToSyncQueue({
          id: uuidv4(),
          type: 'product',
          action: 'update',
          data: { _id: id, ...productData },
          timestamp: Date.now(),
          synced: false
        });
        await refreshProducts();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  };

  // Supprimer un produit
  const deleteProduct = async (id: string) => {
    try {
      if (isOnline) {
        await api.deleteProduct(id);
      } else {
        await addToSyncQueue({
          id: uuidv4(),
          type: 'product',
          action: 'delete',
          data: { _id: id },
          timestamp: Date.now(),
          synced: false
        });
      }
      await deleteProductFromDB(id);
      await refreshProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  };

  // Charger les ventes
  const refreshSales = async () => {
    setLoadingSales(true);
    try {
      if (isOnline) {
        const response = await api.getSales({ limit: 50 });
        if (response.success && response.data) {
          setSales(response.data);
          for (const sale of response.data) {
            await saveSaleToDB(sale);
          }
        }
      } else {
        const localSales = await getSalesFromDB();
        setSales(localSales);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      const localSales = await getSalesFromDB();
      setSales(localSales);
    } finally {
      setLoadingSales(false);
    }
  };

  // Créer une vente
  const createSale = async (saleData: any) => {
    try {
      if (isOnline) {
        const response = await api.createSale(saleData);
        if (response.success && response.data) {
          await saveSaleToDB(response.data);
          await refreshSales();
          await refreshProducts(); // Actualiser les stocks
        }
      } else {
        await addToSyncQueue({
          id: uuidv4(),
          type: 'sale',
          action: 'create',
          data: saleData,
          timestamp: Date.now(),
          synced: false
        });
        await refreshSales();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la vente:', error);
      throw error;
    }
  };

  // Gestion du panier
  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.sellPrice * item.quantity,
    0
  );

  // Synchronisation manuelle
  const manualSync = async () => {
    await syncService.manualSync();
    await refreshProducts();
    await refreshSales();
  };

  // Charger les données au démarrage
  useEffect(() => {
    refreshProducts();
    refreshSales();
  }, []);

  const value: AppContextType = {
    products,
    loadingProducts,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    sales,
    loadingSales,
    refreshSales,
    createSale,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    isOnline,
    pendingSync,
    manualSync
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
};
