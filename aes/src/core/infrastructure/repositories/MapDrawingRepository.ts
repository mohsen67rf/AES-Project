// src/core/infrastructure/repositories/MapDrawingRepository.ts

import type { MapDrawing, MapFeature, MapDrawingService } from '../../domain/types/map.types';

const MAP_DRAWINGS_KEY = 'aes_map_drawings';

export class MapDrawingRepository implements MapDrawingService {
  
  private getDrawingsFromStorage(): MapDrawing[] {
    try {
      const data = localStorage.getItem(MAP_DRAWINGS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveDrawingsToStorage(drawings: MapDrawing[]): void {
    localStorage.setItem(MAP_DRAWINGS_KEY, JSON.stringify(drawings));
  }

  getDrawings(mineId: string): MapDrawing[] {
    const all = this.getDrawingsFromStorage();
    return all.filter(d => d.mineId === mineId);
  }

  getDrawing(id: string): MapDrawing | null {
    const all = this.getDrawingsFromStorage();
    return all.find(d => d.id === id) || null;
  }

  saveDrawing(drawing: MapDrawing): MapDrawing {
    const all = this.getDrawingsFromStorage();
    const index = all.findIndex(d => d.id === drawing.id);
    
    const now = new Date().toISOString();
    const toSave = {
      ...drawing,
      updatedAt: now,
      createdAt: drawing.createdAt || now,
    };

    if (index >= 0) {
      all[index] = toSave;
    } else {
      all.push(toSave);
    }
    
    this.saveDrawingsToStorage(all);
    return toSave;
  }

  deleteDrawing(id: string): boolean {
    const all = this.getDrawingsFromStorage();
    const filtered = all.filter(d => d.id !== id);
    if (filtered.length === all.length) return false;
    this.saveDrawingsToStorage(filtered);
    return true;
  }

  addFeature(drawingId: string, feature: MapFeature): MapFeature {
    const drawing = this.getDrawing(drawingId);
    if (!drawing) throw new Error('نقشه یافت نشد');
    
    drawing.features.push(feature);
    this.saveDrawing(drawing);
    return feature;
  }

  updateFeature(drawingId: string, featureId: string, data: Partial<MapFeature>): MapFeature | null {
    const drawing = this.getDrawing(drawingId);
    if (!drawing) return null;
    
    const index = drawing.features.findIndex(f => f.id === featureId);
    if (index === -1) return null;
    
    drawing.features[index] = {
      ...drawing.features[index],
      ...data,
    };
    
    this.saveDrawing(drawing);
    return drawing.features[index];
  }

  deleteFeature(drawingId: string, featureId: string): boolean {
    const drawing = this.getDrawing(drawingId);
    if (!drawing) return false;
    
    const filtered = drawing.features.filter(f => f.id !== featureId);
    if (filtered.length === drawing.features.length) return false;
    
    drawing.features = filtered;
    this.saveDrawing(drawing);
    return true;
  }

  createDrawing(mineId: string, name: string, createdBy: string): MapDrawing {
    const newDrawing: MapDrawing = {
      id: crypto.randomUUID(),
      mineId,
      name,
      features: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      isPublic: true,
    };
    
    this.saveDrawing(newDrawing);
    return newDrawing;
  }
}

export const mapDrawingRepository = new MapDrawingRepository();