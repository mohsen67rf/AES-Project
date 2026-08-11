// src/core/infrastructure/database/IndexedDBService.ts

export class IndexedDBService {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  // ============================================
  // باز کردن دیتابیس
  // ============================================

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
          console.log(`✅ ObjectStore '${this.storeName}' ایجاد شد`);
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log(`✅ دیتابیس '${this.dbName}' باز شد`);
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // ============================================
  // ذخیره داده
  // ============================================

  async save(id: string, data: any): Promise<void> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ id, data, updatedAt: new Date().toISOString() });

      request.onsuccess = () => {
        console.log(`✅ داده با ID '${id}' ذخیره شد`);
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // ============================================
  // دریافت داده
  // ============================================

  async get(id: string): Promise<any> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.data || null);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // ============================================
  // حذف داده
  // ============================================

  async delete(id: string): Promise<void> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ داده با ID '${id}' حذف شد`);
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // ============================================
  // دریافت همه داده‌ها
  // ============================================

  async getAll(): Promise<any[]> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // ============================================
  // پاک کردن همه داده‌ها
  // ============================================

  async clear(): Promise<void> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`🗑️ همه داده‌های '${this.storeName}' پاک شد`);
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}