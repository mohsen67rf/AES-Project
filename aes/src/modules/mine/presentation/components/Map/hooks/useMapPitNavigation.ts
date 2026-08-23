// src/modules/mine/presentation/components/Map/hooks/useMapPitNavigation.ts

import { useCallback, useEffect, useState } from 'react';
import L from 'leaflet';
import { Pit } from '../../../../../../core/domain/types/mine.types';
import { PitRepository } from '../../../../../../core/infrastructure/repositories';

// داده‌های فرضی برای موقعیت پیت‌ها (در دنیای واقعی از دیتابیس میاد)
const MOCK_PIT_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  // پیت‌های معدن سنگ آهن مرکزی
  'pit1': { lat: 31.52, lng: 54.35, zoom: 15 },
  'pit2': { lat: 31.48, lng: 54.30, zoom: 15 },
  'pit3': { lat: 31.55, lng: 54.40, zoom: 15 },
  'pit4': { lat: 31.45, lng: 54.25, zoom: 15 },
  // پیت‌های معدن آنومالی شمالی
  'pit5': { lat: 31.62, lng: 54.50, zoom: 15 },
  'pit6': { lat: 31.58, lng: 54.45, zoom: 15 },
  // پیت‌های معدن میشدوان
  'pit7': { lat: 31.35, lng: 54.10, zoom: 15 },
  'pit8': { lat: 31.30, lng: 54.05, zoom: 15 },
};

// موقعیت‌های پیش‌فرض برای معادن
const MINE_DEFAULT_LOCATIONS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'سنگ آهن مرکزی': { lat: 31.50, lng: 54.35, zoom: 13 },
  'آنومالی شمالی': { lat: 31.60, lng: 54.48, zoom: 13 },
  'میشدوان': { lat: 31.33, lng: 54.08, zoom: 13 },
};

interface UseMapPitNavigationProps {
  map: any;
  mineName?: string;
  mineId?: string;
  onPitSelect?: (pit: Pit | null) => void;
}

export function useMapPitNavigation({ map, mineName, mineId, onPitSelect }: UseMapPitNavigationProps) {
  const [selectedPitId, setSelectedPitId] = useState<string | null>(null);
  const [pits, setPits] = useState<Pit[]>([]);
  const [pitMarkers, setPitMarkers] = useState<any[]>([]);

  // ============================================
  // بارگذاری پیت‌ها
  // ============================================

  useEffect(() => {
    if (mineId) {
      const pitsData = PitRepository.findBy('mineId', mineId);
      setPits(pitsData);
    }
  }, [mineId]);

  // ============================================
  // دریافت موقعیت یک پیت
  // ============================================

  const getPitCoordinates = useCallback((pitId: string): { lat: number; lng: number; zoom: number } | null => {
    // اول از داده‌های فرضی
    if (MOCK_PIT_COORDINATES[pitId]) {
      return MOCK_PIT_COORDINATES[pitId];
    }
    
    // اگر در داده‌های فرضی نبود، یک موقعیت تصادفی در نزدیکی معدن تولید کن
    const mineLocation = mineName ? MINE_DEFAULT_LOCATIONS[mineName] : { lat: 31.50, lng: 54.35, zoom: 13 };
    const randomOffset = () => (Math.random() - 0.5) * 0.1;
    
    return {
      lat: mineLocation.lat + randomOffset(),
      lng: mineLocation.lng + randomOffset(),
      zoom: 14,
    };
  }, [mineName]);

  // ============================================
  // دریافت موقعیت معدن
  // ============================================

  const getMineLocation = useCallback((): { lat: number; lng: number; zoom: number } => {
    if (mineName && MINE_DEFAULT_LOCATIONS[mineName]) {
      return MINE_DEFAULT_LOCATIONS[mineName];
    }
    return { lat: 31.50, lng: 54.35, zoom: 13 };
  }, [mineName]);

  // ============================================
  // ناوبری به یک پیت خاص
  // ============================================

  const navigateToPit = useCallback((pitId: string | null) => {
    if (!map) return;

    let targetLocation: { lat: number; lng: number; zoom: number };

    if (pitId) {
      const coords = getPitCoordinates(pitId);
      if (coords) {
        targetLocation = coords;
        setSelectedPitId(pitId);
        
        // پیدا کردن پیت انتخاب‌شده
        const selectedPit = pits.find(p => p.id === pitId);
        if (selectedPit && onPitSelect) {
          onPitSelect(selectedPit);
        }
      } else {
        return;
      }
    } else {
      // برگشت به نمای معدن
      targetLocation = getMineLocation();
      setSelectedPitId(null);
      if (onPitSelect) {
        onPitSelect(null);
      }
    }

    // زوم کردن با انیمیشن
    map.flyTo([targetLocation.lat, targetLocation.lng], targetLocation.zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

  }, [map, pits, getPitCoordinates, getMineLocation, onPitSelect]);

  // ============================================
  // تنظیم نمای اولیه (معدن)
  // ============================================

  const navigateToMine = useCallback(() => {
    navigateToPit(null);
  }, [navigateToPit]);

  // ============================================
  // ایجاد مارکرهای پیت‌ها روی نقشه
  // ============================================

  useEffect(() => {
    if (!map || !pits.length) return;

    // حذف مارکرهای قبلی
    pitMarkers.forEach((marker: any) => {
      map.removeLayer(marker);
    });

    const newMarkers: any[] = [];

    pits.forEach((pit: Pit) => {
      const coords = getPitCoordinates(pit.id);
      if (!coords) return;

      // ایجاد آیکون با DivIcon
      const icon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-4 h-4 bg-[#C9A227] rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" 
                 style="box-shadow: 0 0 15px rgba(201, 162, 39, 0.5);"
                 data-pit-id="${pit.id}">
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-medium text-white whitespace-nowrap bg-black/50 px-1.5 py-0.5 rounded">
              ${pit.code}
            </div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: 'pit-marker-container',  // ✅ اینجا درست کار میکنه
      });

      const marker = L.marker([coords.lat, coords.lng], { icon });

      // رویداد کلیک روی مارکر
      marker.on('click', () => {
        navigateToPit(pit.id);
      });

      marker.addTo(map);
      newMarkers.push(marker);
    });

    setPitMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker: any) => {
        map.removeLayer(marker);
      });
    };
  }, [map, pits, getPitCoordinates, navigateToPit]);

  // ============================================
  // خروجی هوک
  // ============================================

  return {
    selectedPitId,
    pits,
    navigateToPit,
    navigateToMine,
    getPitCoordinates,
    getMineLocation,
  };
}