// src/core/infrastructure/database/MapDatabaseService.ts

import { IndexedDBService } from './IndexedDBService';

export interface MapData {
  id: string;
  type: 'geojson' | 'drawing' | 'pit_map';
  name: string;
  data: any;
  pitId?: string;
  mineId?: string;
  createdAt: string;
  updatedAt: string;
}

export class MapDatabaseService {
  private db: IndexedDBService;

  constructor() {
    this.db = new IndexedDBService('AESMapDB', 'maps');
  }

  // ============================================
  // ذخیره نقشه معدن
  // ============================================

  async saveMap(id: string, data: any, name: string = 'نقشه معدن'): Promise<void> {
    if (!data || !data.features || data.features.length === 0) {
      console.warn('⚠️ داده‌های نقشه خالی هستند، ذخیره نمی‌شود');
      return;
    }

    const mapData: MapData = {
      id,
      type: 'geojson',
      name,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await this.db.save(id, mapData);
    console.log('✅ نقشه معدن در IndexedDB ذخیره شد');
  }

  // ============================================
  // ذخیره نقشه پیت
  // ============================================

  async savePitMap(pitId: string, data: any, name: string, mineId?: string): Promise<void> {
    if (!data || !data.features || data.features.length === 0) {
      console.warn('⚠️ داده‌های نقشه پیت خالی هستند، ذخیره نمی‌شود');
      return;
    }

    const mapData: MapData = {
      id: `pit_${pitId}`,
      type: 'pit_map',
      name,
      data,
      pitId,
      mineId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await this.db.save(`pit_${pitId}`, mapData);
    console.log(`✅ نقشه پیت ${name} در IndexedDB ذخیره شد`);
  }

  // ============================================
  // پاک کردن همه نقشه‌ها (کل دیتابیس)
  // ============================================

  async clearAllMaps(): Promise<void> {
    await this.db.clearAll();
    console.log('🗑️ همه نقشه‌ها پاک شدند');
  }

  // ============================================
  // پاک کردن نقشه یک معدن
  // ============================================

  async clearMap(id: string): Promise<void> {
    await this.db.delete(id);
    console.log(`🗑️ نقشه ${id} پاک شد`);
  }

  // ============================================
  // دریافت نقشه پیت
  // ============================================

  async getPitMap(pitId: string): Promise<MapData | null> {
    const result = await this.db.get(`pit_${pitId}`);
    return result || null;
  }

  // ============================================
  // دریافت همه نقشه‌های پیت‌های یک معدن
  // ============================================

  async getAllPitMaps(mineId: string): Promise<MapData[]> {
    const results = await this.db.getAll();
    return results
      .map((item: any) => item.data)
      .filter((item: MapData) => item.type === 'pit_map' && item.mineId === mineId);
  }

  // ============================================
  // دریافت نقشه معدن
  // ============================================

  async getMap(id: string): Promise<MapData | null> {
    const result = await this.db.get(id);
    return result || null;
  }

  // ============================================
  // دریافت همه نقشه‌ها
  // ============================================

  async getAllMaps(): Promise<MapData[]> {
    const results = await this.db.getAll();
    return results.map((item: any) => item.data);
  }

  // ============================================
  // حذف نقشه
  // ============================================

  async deleteMap(id: string): Promise<void> {
    await this.db.delete(id);
  }
}

export const mapDatabase = new MapDatabaseService();