// src/modules/mine/presentation/components/Map/hooks/useMapSetup.ts

import { useCallback, RefObject, useRef } from 'react';
import L from 'leaflet';

interface UseMapSetupProps {
  mapRef: RefObject<HTMLDivElement | null>;
  backgroundColor: string;
  onMapClick?: (coord: { lat: number; lng: number }) => void;
}

export function useMapSetup({ mapRef, backgroundColor, onMapClick }: UseMapSetupProps) {
  const isMapInitialized = useRef(false);

  const initializeMap = useCallback(() => {
    // ✅ جلوگیری از ساخت دوباره نقشه
    if (!mapRef.current || isMapInitialized.current) {
      console.log('ℹ️ نقشه قبلاً ساخته شده است');
      return null;
    }

    console.log('🗺️ ایجاد نقشه...');

    const mapInstance = L.map(mapRef.current, {
      center: [31.5, 54.3],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // لایه پایه
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 20,
    }).addTo(mapInstance);

    // ذخیره در window برای دسترسی
    (window as any).__MAP_INSTANCE__ = mapInstance;

    // رویداد کلیک
    if (onMapClick) {
      mapInstance.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onMapClick({ lat, lng });
      });
    }

    isMapInitialized.current = true;
    console.log('✅ نقشه راه‌اندازی شد');
    return mapInstance;
  }, [mapRef, onMapClick]);

  const cleanupMap = useCallback(() => {
    if (mapRef.current && isMapInitialized.current) {
      const map = (window as any).__MAP_INSTANCE__;
      if (map) {
        map.remove();
        (window as any).__MAP_INSTANCE__ = null;
        isMapInitialized.current = false;
        console.log('🗑️ نقشه پاکسازی شد');
      }
    }
  }, [mapRef]);

  return { initializeMap, cleanupMap };
}