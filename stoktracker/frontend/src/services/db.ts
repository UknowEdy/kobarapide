import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, STORES } from '@/config/api';
import { Product, Sale, SyncQueueItem } from '@/types';

interface StokTrackerDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-name': string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: { 'by-date': string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-synced': boolean };
  };
}

let dbInstance: IDBPDatabase<StokTrackerDB> | null = null;

export const initDB = async (): Promise<IDBPDatabase<StokTrackerDB>> => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<StokTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store des produits
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productStore = db.createObjectStore(STORES.PRODUCTS, {
          keyPath: '_id'
        });
        productStore.createIndex('by-name', 'name');
      }

      // Store des ventes
      if (!db.objectStoreNames.contains(STORES.SALES)) {
        const saleStore = db.createObjectStore(STORES.SALES, {
          keyPath: '_id'
        });
        saleStore.createIndex('by-date', 'saleDate');
      }

      // Store de la queue de synchronisation
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id'
        });
        syncStore.createIndex('by-synced', 'synced');
      }
    }
  });

  return dbInstance;
};

// PRODUITS
export const saveProductToDB = async (product: Product): Promise<void> => {
  const db = await initDB();
  await db.put(STORES.PRODUCTS, product);
};

export const getProductsFromDB = async (): Promise<Product[]> => {
  const db = await initDB();
  return await db.getAll(STORES.PRODUCTS);
};

export const getProductByIdFromDB = async (id: string): Promise<Product | undefined> => {
  const db = await initDB();
  return await db.get(STORES.PRODUCTS, id);
};

export const deleteProductFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORES.PRODUCTS, id);
};

export const clearProductsDB = async (): Promise<void> => {
  const db = await initDB();
  await db.clear(STORES.PRODUCTS);
};

// VENTES
export const saveSaleToDB = async (sale: Sale): Promise<void> => {
  const db = await initDB();
  await db.put(STORES.SALES, sale);
};

export const getSalesFromDB = async (): Promise<Sale[]> => {
  const db = await initDB();
  return await db.getAll(STORES.SALES);
};

export const getSaleByIdFromDB = async (id: string): Promise<Sale | undefined> => {
  const db = await initDB();
  return await db.get(STORES.SALES, id);
};

export const deleteSaleFromDB = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORES.SALES, id);
};

export const clearSalesDB = async (): Promise<void> => {
  const db = await initDB();
  await db.clear(STORES.SALES);
};

// QUEUE DE SYNCHRONISATION
export const addToSyncQueue = async (item: SyncQueueItem): Promise<void> => {
  const db = await initDB();
  await db.put(STORES.SYNC_QUEUE, item);
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const db = await initDB();
  return await db.getAll(STORES.SYNC_QUEUE);
};

export const getUnsyncedItems = async (): Promise<SyncQueueItem[]> => {
  const db = await initDB();
  const index = db.transaction(STORES.SYNC_QUEUE).store.index('by-synced');
  return await index.getAll(false);
};

export const markItemAsSynced = async (id: string): Promise<void> => {
  const db = await initDB();
  const item = await db.get(STORES.SYNC_QUEUE, id);
  if (item) {
    item.synced = true;
    await db.put(STORES.SYNC_QUEUE, item);
  }
};

export const clearSyncQueue = async (): Promise<void> => {
  const db = await initDB();
  await db.clear(STORES.SYNC_QUEUE);
};

// NETTOYAGE COMPLET
export const clearAllData = async (): Promise<void> => {
  await clearProductsDB();
  await clearSalesDB();
  await clearSyncQueue();
};
