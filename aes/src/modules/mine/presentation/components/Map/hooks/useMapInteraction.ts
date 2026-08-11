// src/modules/mine/presentation/components/Map/hooks/useMapInteraction.ts

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getDrawOptions, getToolLabel } from '../tools/DrawingTools';
import { calculateMeasurement } from '../tools/MeasurementTools';

interface UseMapInteractionProps {
  map: any;
  activeTool: string;
  isReady: boolean;
  onDrawComplete?: (feature: any) => void;
  onMeasureComplete?: (result: { type: string; value: number; unit: string }) => void;
}

export function useMapInteraction({
  map,
  activeTool,
  isReady,
  onDrawComplete,
  onMeasureComplete,
}: UseMapInteractionProps) {
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !isReady) return;

    // حذف کنترل قبلی
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    // اگر ابزاری فعال نیست
    if (activeTool === 'none' || activeTool === 'select') {
      return;
    }

    // ایجاد لایه ترسیمات
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = L.featureGroup().addTo(map);
    }

    // تنظیمات draw
    const drawOptions = getDrawOptions(activeTool);
    if (!drawOptions) return;

    try {
      const DrawControl = (L as any).Control.Draw;
      const drawControl = new DrawControl({
        position: 'topright',
        draw: drawOptions,
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
        },
      });

      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      // ============================================
      // رویداد پایان ترسیم
      // ============================================

      map.on((L as any).Draw.Event.CREATED, (event: any) => {
        const { layer } = event;
        const geojson = layer.toGeoJSON();

        // اندازه‌گیری
        if (activeTool === 'measureDistance' || activeTool === 'measureArea') {
          const result = calculateMeasurement(layer, activeTool);
          if (result && onMeasureComplete) {
            onMeasureComplete(result);
          }
          // حذف لایه اندازه‌گیری بعد از ۳ ثانیه
          setTimeout(() => {
            if (drawnItemsRef.current) {
              drawnItemsRef.current.removeLayer(layer);
            }
          }, 3000);
          return;
        }

        // ذخیره ترسیم
        if (onDrawComplete) {
          onDrawComplete(geojson);
        }

        // اضافه کردن به لایه ترسیمات
        if (drawnItemsRef.current) {
          drawnItemsRef.current.addLayer(layer);
        }
      });

      // رویداد حذف
      map.on((L as any).Draw.Event.DELETED, (event: any) => {
        console.log('🗑️ ترسیم حذف شد:', event);
      });

      // رویداد ویرایش
      map.on((L as any).Draw.Event.EDITED, (event: any) => {
        console.log('✏️ ترسیم ویرایش شد:', event);
      });

      console.log(`✅ ابزار ${getToolLabel(activeTool)} فعال شد`);

    } catch (error) {
      console.error('❌ خطا در راه‌اندازی ابزار:', error);
    }

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    };
  }, [map, activeTool, isReady, onDrawComplete, onMeasureComplete]);

  return { drawControlRef, drawnItemsRef };
}