import api from './api';
import {
  getUnsyncedItems,
  markItemAsSynced,
  getProductsFromDB,
  saveProductToDB,
  getSalesFromDB,
  saveSaleToDB,
  clearProductsDB,
  clearSalesDB
} from './db';
import { SyncQueueItem, Product, Sale } from '@/types';

class SyncService {
  private syncing = false;
  private syncInterval: number | null = null;

  // Démarrer la synchronisation automatique
  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      return;
    }

    this.syncInterval = window.setInterval(() => {
      this.syncAll();
    }, intervalMs);

    // Synchronisation immédiate au démarrage
    this.syncAll();
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Vérifier si en ligne
  async isOnline(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      return await api.healthCheck();
    } catch {
      return false;
    }
  }

  // Synchroniser tout
  async syncAll(): Promise<void> {
    if (this.syncing) {
      return;
    }

    const online = await this.isOnline();
    if (!online) {
      console.log('📴 Mode hors ligne - synchronisation annulée');
      return;
    }

    try {
      this.syncing = true;
      console.log('🔄 Début de la synchronisation...');

      // Synchroniser la queue des opérations non synchronisées
      await this.syncQueue();

      // Synchroniser les données depuis le serveur
      await this.syncFromServer();

      console.log('✅ Synchronisation terminée');
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
    } finally {
      this.syncing = false;
    }
  }

  // Synchroniser la queue des opérations locales vers le serveur
  private async syncQueue(): Promise<void> {
    const unsyncedItems = await getUnsyncedItems();

    if (unsyncedItems.length === 0) {
      return;
    }

    console.log(`📤 ${unsyncedItems.length} opérations à synchroniser`);

    for (const item of unsyncedItems) {
      try {
        await this.syncItem(item);
        await markItemAsSynced(item.id);
        console.log(`✓ Item ${item.id} synchronisé`);
      } catch (error) {
        console.error(`✗ Échec de synchronisation pour ${item.id}:`, error);
      }
    }
  }

  // Synchroniser un item individuel
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { type, action, data } = item;

    if (type === 'product') {
      if (action === 'create') {
        await api.createProduct(data);
      } else if (action === 'update') {
        await api.updateProduct(data._id, data);
      } else if (action === 'delete') {
        await api.deleteProduct(data._id);
      }
    } else if (type === 'sale') {
      if (action === 'create') {
        await api.createSale(data);
      } else if (action === 'delete') {
        await api.deleteSale(data._id);
      }
    }
  }

  // Synchroniser les données depuis le serveur vers IndexedDB
  private async syncFromServer(): Promise<void> {
    try {
      // Récupérer les produits du serveur
      const productsResponse = await api.getProducts();
      if (productsResponse.success && productsResponse.data) {
        await clearProductsDB();
        for (const product of productsResponse.data) {
          await saveProductToDB(product);
        }
        console.log(`📦 ${productsResponse.data.length} produits synchronisés`);
      }

      // Récupérer les ventes récentes du serveur
      const salesResponse = await api.getSales({ limit: 100 });
      if (salesResponse.success && salesResponse.data) {
        await clearSalesDB();
        for (const sale of salesResponse.data) {
          await saveSaleToDB(sale);
        }
        console.log(`💰 ${salesResponse.data.length} ventes synchronisées`);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation depuis le serveur:', error);
      throw error;
    }
  }

  // Synchroniser manuellement
  async manualSync(): Promise<{ success: boolean; message: string }> {
    const online = await this.isOnline();

    if (!online) {
      return {
        success: false,
        message: 'Pas de connexion Internet. La synchronisation sera effectuée automatiquement lorsque vous serez en ligne.'
      };
    }

    try {
      await this.syncAll();
      return {
        success: true,
        message: 'Synchronisation réussie !'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur de synchronisation: ${error.message}`
      };
    }
  }

  // Obtenir le statut de synchronisation
  async getSyncStatus(): Promise<{
    online: boolean;
    pendingItems: number;
  }> {
    const online = await this.isOnline();
    const unsyncedItems = await getUnsyncedItems();

    return {
      online,
      pendingItems: unsyncedItems.length
    };
  }
}

export default new SyncService();
