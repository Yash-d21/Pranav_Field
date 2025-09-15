// Offline Storage Service for PWA
export interface OfflineRecord {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  synced: boolean;
  url: string;
  method: string;
}

export class OfflineStorageService {
  private dbName = 'FieldMaintenanceDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create offline records store
        if (!db.objectStoreNames.contains('offlineRecords')) {
          const store = db.createObjectStore('offlineRecords', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        // Create form data store
        if (!db.objectStoreNames.contains('formData')) {
          const store = db.createObjectStore('formData', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
        }
      };
    });
  }

  // Store form data offline
  async storeFormData(type: string, data: any): Promise<string> {
    if (!this.db) await this.init();

    const record: OfflineRecord = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
      url: this.getApiUrl(type),
      method: 'POST'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['formData'], 'readwrite');
      const store = transaction.objectStore('formData');
      const request = store.add(record);

      request.onsuccess = () => {
        console.log('Form data stored offline:', record);
        resolve(record.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store API request for later sync
  async storeApiRequest(url: string, method: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    const record = {
      id: this.generateId(),
      url,
      method,
      data,
      timestamp: new Date().toISOString(),
      priority: this.getPriority(method)
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(record);

      request.onsuccess = () => {
        console.log('API request stored for sync:', record);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get all offline records
  async getOfflineRecords(): Promise<OfflineRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['formData'], 'readonly');
      const store = transaction.objectStore('formData');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get unsynced records
  async getUnsyncedRecords(): Promise<OfflineRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['formData'], 'readonly');
      const store = transaction.objectStore('formData');
      const index = store.index('synced');
      const request = index.getAll(false); // false = not synced

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark record as synced
  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['formData'], 'readwrite');
      const store = transaction.objectStore('formData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.synced = true;
          const updateRequest = store.put(record);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Delete synced records
  async deleteSyncedRecords(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['formData'], 'readwrite');
      const store = transaction.objectStore('formData');
      const index = store.index('synced');
      const request = index.getAll(true); // true = synced

      request.onsuccess = () => {
        const syncedRecords = request.result;
        const deletePromises = syncedRecords.map(record => 
          new Promise<void>((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(record.id);
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          })
        );

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['formData', 'syncQueue'], 'readwrite');
      
      const clearFormData = transaction.objectStore('formData').clear();
      const clearSyncQueue = transaction.objectStore('syncQueue').clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Check if online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Listen for online/offline events
  onOnlineStatusChange(callback: (online: boolean) => void): void {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }

  // Sync all offline data
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Offline - skipping sync');
      return;
    }

    const unsyncedRecords = await this.getUnsyncedRecords();
    console.log('Syncing offline data:', unsyncedRecords.length, 'records');

    for (const record of unsyncedRecords) {
      try {
        const response = await fetch(record.url, {
          method: record.method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(record.data)
        });

        if (response.ok) {
          await this.markAsSynced(record.id);
          console.log('Synced record:', record.id);
        } else {
          console.error('Failed to sync record:', record.id, response.status);
        }
      } catch (error) {
        console.error('Error syncing record:', record.id, error);
      }
    }

    // Clean up synced records
    await this.deleteSyncedRecords();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getApiUrl(type: string): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost/field-maintenance/php';
    
    switch (type) {
      case 'punch_in':
        return `${baseUrl}/records.php`;
      case 'corrective_maintenance':
        return `${baseUrl}/records.php`;
      case 'preventive_maintenance':
        return `${baseUrl}/records.php`;
      case 'change_request':
        return `${baseUrl}/records.php`;
      case 'gp_live_check':
        return `${baseUrl}/records.php`;
      case 'patroller_task':
        return `${baseUrl}/records.php`;
      default:
        return `${baseUrl}/records.php`;
    }
  }

  private getPriority(method: string): number {
    switch (method) {
      case 'POST':
        return 1; // High priority for new data
      case 'PUT':
        return 2; // Medium priority for updates
      case 'DELETE':
        return 3; // Low priority for deletions
      default:
        return 2;
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();
