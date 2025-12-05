/**
 * Offline Queue Service
 * Manages pending transactions when network is unavailable
 */

export interface PendingTransaction {
  id: string;
  timestamp: number;
  type: 'sale' | 'purchase' | 'expense' | 'capital' | 'withdrawal' | 'debt_settlement';
  data: any;
  retryCount: number;
  error?: string;
}

export interface CachedData {
  products: any[];
  customers: any[];
  suppliers: any[];
  settings: any;
  lastUpdated: number;
}

const QUEUE_KEY = 'fox_offline_queue';
const CACHE_KEY = 'fox_offline_cache';
const NETWORK_STATUS_KEY = 'fox_network_status';

class OfflineService {
  private queue: PendingTransaction[] = [];
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupNetworkListeners();
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('Network: Online');
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncPendingTransactions();
    });

    window.addEventListener('offline', () => {
      console.log('Network: Offline');
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  /**
   * Add listener for network status changes
   */
  addNetworkListener(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    // Immediately notify with current status
    callback(this.isOnline);
  }

  /**
   * Remove network listener
   */
  removeNetworkListener(callback: (isOnline: boolean) => void) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of network status change
   */
  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => callback(isOnline));
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Add transaction to queue
   */
  addToQueue(type: PendingTransaction['type'], data: any): string {
    const transaction: PendingTransaction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      data,
      retryCount: 0
    };

    this.queue.push(transaction);
    this.saveQueue();
    
    console.log('Transaction queued for offline sync:', transaction);
    return transaction.id;
  }

  /**
   * Get all pending transactions
   */
  getPendingTransactions(): PendingTransaction[] {
    return [...this.queue];
  }

  /**
   * Get pending transactions count
   */
  getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Clear all pending transactions
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Remove specific transaction from queue
   */
  removeFromQueue(id: string) {
    this.queue = this.queue.filter(t => t.id !== id);
    this.saveQueue();
  }

  /**
   * Update transaction error
   */
  private updateTransactionError(id: string, error: string) {
    const transaction = this.queue.find(t => t.id === id);
    if (transaction) {
      transaction.error = error;
      transaction.retryCount++;
      this.saveQueue();
    }
  }

  /**
   * Sync pending transactions to backend
   */
  async syncPendingTransactions(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline || this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    console.log(`Starting sync of ${this.queue.length} pending transactions...`);
    
    // Sort by timestamp (chronological order)
    const sortedQueue = [...this.queue].sort((a, b) => a.timestamp - b.timestamp);
    
    let successCount = 0;
    let failedCount = 0;

    for (const transaction of sortedQueue) {
      try {
        await this.syncTransaction(transaction);
        this.removeFromQueue(transaction.id);
        successCount++;
        console.log(`Synced transaction ${transaction.id}`);
      } catch (error: any) {
        failedCount++;
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        this.updateTransactionError(transaction.id, errorMessage);
        console.error(`Failed to sync transaction ${transaction.id}:`, errorMessage);
        
        // Stop syncing if we hit max retries
        if (transaction.retryCount >= 3) {
          console.error(`Transaction ${transaction.id} exceeded max retries, flagging for manual review`);
        }
      }
    }

    console.log(`Sync complete: ${successCount} success, ${failedCount} failed`);
    return { success: successCount, failed: failedCount };
  }

  /**
   * Sync individual transaction
   */
  private async syncTransaction(transaction: PendingTransaction): Promise<void> {
    // Import endpoints dynamically to avoid circular dependencies
    const { transactionsAPI } = await import('./endpoints');

    switch (transaction.type) {
      case 'sale':
        await transactionsAPI.createSale(transaction.data);
        break;
      case 'purchase':
        await transactionsAPI.createPurchase(transaction.data);
        break;
      case 'expense':
        await transactionsAPI.createExpense(transaction.data);
        break;
      case 'capital':
        await transactionsAPI.createCapital(transaction.data);
        break;
      case 'withdrawal':
        await transactionsAPI.createWithdrawal(transaction.data);
        break;
      case 'debt_settlement':
        if (transaction.data.entityType === 'customer') {
          const { customersAPI } = await import('./endpoints');
          await customersAPI.settleDebt(transaction.data.entityId, transaction.data);
        } else {
          const { suppliersAPI } = await import('./endpoints');
          await suppliersAPI.settleDebt(transaction.data.entityId, transaction.data);
        }
        break;
      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }
  }

  /**
   * Cache data for offline use
   */
  cacheData(data: Partial<CachedData>) {
    try {
      const existing = this.getCachedData();
      const updated: CachedData = {
        ...existing,
        ...data,
        lastUpdated: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      console.log('Data cached for offline use');
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  getCachedData(): CachedData {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }

    return {
      products: [],
      customers: [],
      suppliers: [],
      settings: null,
      lastUpdated: 0
    };
  }

  /**
   * Check if operation is allowed offline
   */
  isOperationAllowedOffline(operation: string): boolean {
    const restrictedOperations = [
      'delete_product',
      'delete_customer',
      'delete_supplier',
      'delete_user',
      'factory_reset',
      'clear_transactions',
      'user_management',
      'backup',
      'restore'
    ];

    return !restrictedOperations.includes(operation);
  }

  /**
   * Get cache age in minutes
   */
  getCacheAge(): number {
    const cached = this.getCachedData();
    if (cached.lastUpdated === 0) return Infinity;
    return Math.floor((Date.now() - cached.lastUpdated) / 1000 / 60);
  }
}

// Export singleton instance
export const offlineService = new OfflineService();
