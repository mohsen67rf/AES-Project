// src/core/infrastructure/database/MapDatabaseService.ts

import { IndexedDBService } from './IndexedDBService';

export interface MapData {
  id: string;
  type: 'geojson' | 'drawing';
  name: string;
  data: any;  // ✅ باید خود GeoJSON باشد
  createdAt: string;
  updatedAt: string;
}

export class MapDatabaseService {
  private db: IndexedDBService;

  constructor() {
    this.db = new IndexedDBService('AESMapDB', 'maps');
  }

  async saveMap(id: string, data: any, name: string = 'نقشه معدن'): Promise<void> {
    // ✅ اطمینان از اینکه data یک GeoJSON معتبر است
    if (!data || !data.type || data.type !== 'FeatureCollection') {
      console.error('❌ داده GeoJSON نامعتبر است:', data);
      throw new Error('داده باید از نوع FeatureCollection باشد');
    }

    const mapData: MapData = {
      id,
      type: 'geojson',
      name,
      data,  // ✅ خود داده اصلی
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.db.save(id, mapData);
    console.log('✅ نقشه در IndexedDB ذخیره شد');
  }

  async getMap(id: string): Promise<MapData | null> {
    const result = await this.db.get(id);
    return result || null;
  }

  async getAllMaps(): Promise<MapData[]> {
    const results = await this.db.getAll();
    return results.map((item: any) => item.data);
  }

  async deleteMap(id: string): Promise<void> {
    await this.db.delete(id);
  }

  async saveDrawing(id: string, data: any, name: string = 'ترسیم جدید'): Promise<void> {
    const drawingData: MapData = {
      id,
      type: 'drawing',
      name,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.db.save(id, drawingData);
  }

  async getDrawing(id: string): Promise<MapData | null> {
    return await this.getMap(id);
  }

  async getAllDrawings(): Promise<MapData[]> {
    const results = await this.db.getAll();
    return results
      .map((item: any) => item.data)
      .filter((item: MapData) => item.type === 'drawing');
  }
}

export const mapDatabase = new MapDatabaseService();