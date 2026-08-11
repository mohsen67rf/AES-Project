export class LocalStorageRepository<T extends { id: string }> {
  private key: string;
  private cache: T[] | null = null;

  constructor(key: string) {
    this.key = key;
  }

  // ===== متدهای اصلی =====
  
  getAll(): T[] {
    if (this.cache !== null) return this.cache;
    
    try {
      const data = localStorage.getItem(this.key);
      this.cache = data ? JSON.parse(data) : [];
      return this.cache;
    } catch {
      this.cache = [];
      return this.cache;
    }
  }

  getById(id: string): T | null {
    return this.getAll().find(item => item.id === id) || null;
  }

  save(item: T): T {
    const items = this.getAll();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = { ...items[index], ...item };
    } else {
      items.push(item);
    }
    
    this.cache = items;
    localStorage.setItem(this.key, JSON.stringify(items));
    return item;
  }

  saveMany(items: T[]): T[] {
    const existing = this.getAll();
    const updatedItems = [...existing];
    
    items.forEach(item => {
      const index = updatedItems.findIndex(i => i.id === item.id);
      if (index >= 0) {
        updatedItems[index] = { ...updatedItems[index], ...item };
      } else {
        updatedItems.push(item);
      }
    });
    
    this.cache = updatedItems;
    localStorage.setItem(this.key, JSON.stringify(updatedItems));
    return items;
  }

  delete(id: string): boolean {
    const items = this.getAll().filter(i => i.id !== id);
    this.cache = items;
    localStorage.setItem(this.key, JSON.stringify(items));
    return true;
  }

  deleteMany(ids: string[]): boolean {
    const items = this.getAll().filter(i => !ids.includes(i.id));
    this.cache = items;
    localStorage.setItem(this.key, JSON.stringify(items));
    return true;
  }

  clear(): void {
    this.cache = [];
    localStorage.removeItem(this.key);
  }

  // ===== متدهای جستجو =====
  
  findBy(field: keyof T, value: any): T[] {
    return this.getAll().filter(item => item[field] === value);
  }

  findOne(field: keyof T, value: any): T | null {
    return this.findBy(field, value)[0] || null;
  }

  exists(id: string): boolean {
    return !!this.getById(id);
  }

  count(): number {
    return this.getAll().length;
  }

  // ===== متدهای پیشرفته =====
  
  paginate(page: number = 1, pageSize: number = 10): {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
  } {
    const items = this.getAll();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      items: items.slice(start, end),
      total: items.length,
      page,
      totalPages: Math.ceil(items.length / pageSize),
    };
  }

  sortBy(field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    const items = this.getAll();
    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ===== متدهای مدیریت کش =====
  
  invalidateCache(): void {
    this.cache = null;
  }

  refresh(): T[] {
    this.cache = null;
    return this.getAll();
  }
}