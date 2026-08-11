// src/modules/mine/presentation/components/Map/tools/MeasurementTools.ts

export function calculateMeasurement(layer: any, tool: string): { type: string; value: number; unit: string } | null {
  try {
    if (tool === 'measureDistance') {
      const coords = layer.getLatLngs();
      if (!coords || coords.length < 2) return null;
      let distance = 0;
      for (let i = 1; i < coords.length; i++) {
        if (coords[i - 1] && coords[i]) {
          distance += coords[i - 1].distanceTo(coords[i]);
        }
      }
      return { type: 'distance', value: distance, unit: 'متر' };
    }

    if (tool === 'measureArea') {
      const latlngs = layer.getLatLngs();
      if (!latlngs || !latlngs[0] || latlngs[0].length < 3) return null;
      const points = latlngs[0];
      let area = 0;
      const n = points.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i].lng * points[j].lat - points[j].lng * points[i].lat;
      }
      area = Math.abs(area) / 2;
      const metersPerDegree = 111320;
      area = area * metersPerDegree * metersPerDegree;
      return { type: 'area', value: area, unit: 'متر مربع' };
    }
  } catch (error) {
    console.error('❌ خطا در محاسبه:', error);
  }
  return null;
}

export const MEASUREMENT_COLORS = {
  distance: '#FF6B6B',
  area: '#4ECDC4',
};