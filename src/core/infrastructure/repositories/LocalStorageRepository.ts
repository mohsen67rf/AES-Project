// src/core/infrastructure/repositories/LocalStorageRepository.ts

export class LocalStorageRepository<T extends { id: string }> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${this.key} from localStorage`, e);
      return [];
    }
  }

  getById(id: string): T | null {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  getByBlockId(blockId: string): T[] {
    return this.getAll().filter((item: any) => item.blockId === blockId);
  }

  update(id: string, updatedFields: Partial<T> | T): T | null {
    const items = this.getAll();
    const index = items.findIndex((i) => i.id === id);
    if (index >= 0) {
      items[index] = { ...items[index], ...updatedFields };
      this.persist(items);
      return items[index];
    }
    return null;
  }

  save(item: T): T {
    const items = this.getAll();
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    this.persist(items);
    return item;
  }

  saveBatch(newItems: T[]): T[] {
    const items = this.getAll();
    const map = new Map<string, T>(items.map((i) => [i.id, i]));
    for (const it of newItems) {
      map.set(it.id, it);
    }
    const merged = Array.from(map.values());
    this.persist(merged);
    return newItems;
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length !== items.length) {
      this.persist(filtered);
      return true;
    }
    return false;
  }

  findBy<K extends keyof T>(field: K, value: T[K]): T[] {
    return this.getAll().filter((item) => item[field] === value);
  }

  count(): number {
    return this.getAll().length;
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  private persist(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (e) {
      console.error(`Error saving ${this.key} to localStorage`, e);
    }
  }
}

export default LocalStorageRepository;
