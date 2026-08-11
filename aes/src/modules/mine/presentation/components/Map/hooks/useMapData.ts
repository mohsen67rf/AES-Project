// src/modules/mine/presentation/components/Map/hooks/useMapData.ts

import { useCallback } from 'react';
import L from 'leaflet';

interface UseMapDataProps {
  map: any;
  geoData?: any;
  drillingPoints?: { x: number; y: number }[];
  blocks?: any[];
}

export function useMapData({ map, geoData, drillingPoints, blocks }: UseMapDataProps) {
  
  const loadData = useCallback((data: any) => {
    if (!map || !data) {
      console.warn('⚠️ نقشه یا داده وجود ندارد');
      return null;
    }

    console.log('📊 بارگذاری داده‌های GeoJSON...');
    console.log('📊 تعداد ویژگی‌ها:', data.features?.length || 0);

    try {
      // حذف لایه‌های قبلی
      map.eachLayer((layer: any) => {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });

      const geoJsonLayer = L.geoJSON(data, {
        style: {
          color: '#FF6B6B',
          weight: 3,
          fillColor: '#FF6B6B',
          fillOpacity: 0.2,
        },
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#FF6B6B',
            color: '#FFFFFF',
            weight: 2,
            fillOpacity: 0.9,
          });
        },
        onEachFeature: (feature, layer) => {
          if (feature?.properties?.name) {
            layer.bindPopup(`
              <div style="text-align:right; direction:rtl; padding:8px;">
                <strong>${feature.properties.name}</strong>
              </div>
            `);
          }
        },
      }).addTo(map);

      // زوم روی داده‌ها
      setTimeout(() => {
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { 
            padding: [50, 50], 
            maxZoom: 18,
            duration: 800,
          });
          console.log('✅ زوم روی داده‌ها انجام شد');
        }
      }, 300);

      console.log('✅ داده‌ها با موفقیت بارگذاری شدند');
      return geoJsonLayer;
    } catch (error) {
      console.error('❌ خطا در بارگذاری داده‌ها:', error);
      return null;
    }
  }, [map]);

  const updateData = useCallback((data: any) => {
    if (!map || !data) return;
    loadData(data);
  }, [map, loadData]);

  return { loadData, updateData };
}