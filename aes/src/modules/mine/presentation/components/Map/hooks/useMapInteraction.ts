// src/modules/mine/presentation/components/Map/hooks/useMapInteraction.ts

import { useEffect, useRef } from 'react';
import L from 'leaflet';

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

    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (activeTool === 'none' || activeTool === 'select') {
      return;
    }

    if (!drawnItemsRef.current) {
      drawnItemsRef.current = L.featureGroup().addTo(map);
    }

    const getDrawOptions = (tool: string) => {
      const baseStyle = {
        shapeOptions: {
          color: '#C9A227',
          weight: 3,
          fillColor: '#C9A227',
          fillOpacity: 0.2,
        },
      };

      const tools: Record<string, any> = {
        point: {
          marker: {
            icon: L.divIcon({
              className: 'custom-marker',
              html: '<div style="background:#C9A227;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [14, 14],
            }),
          },
        },
        line: { polyline: baseStyle },
        polygon: { polygon: baseStyle, rectangle: baseStyle },
        measureDistance: {
          polyline: {
            shapeOptions: { color: '#FF6B6B', weight: 3, dashArray: '5,5' },
            metric: true,
          },
        },
        measureArea: {
          polygon: {
            shapeOptions: { color: '#4ECDC4', weight: 2, fillColor: '#4ECDC4', fillOpacity: 0.2 },
            metric: true,
          },
        },
      };

      return tools[tool] || null;
    };

    const calculateMeasurement = (layer: any, tool: string): { type: string; value: number; unit: string } | null => {
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
    };

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

      map.on((L as any).Draw.Event.CREATED, (event: any) => {
        const { layer } = event;
        const geojson = layer.toGeoJSON();

        if (activeTool === 'measureDistance' || activeTool === 'measureArea') {
          const result = calculateMeasurement(layer, activeTool);
          if (result && onMeasureComplete) {
            onMeasureComplete(result);
          }
          setTimeout(() => {
            if (drawnItemsRef.current) {
              drawnItemsRef.current.removeLayer(layer);
            }
          }, 3000);
          return;
        }

        if (onDrawComplete) {
          onDrawComplete(geojson);
        }

        if (drawnItemsRef.current) {
          drawnItemsRef.current.addLayer(layer);
        }
      });

      map.on((L as any).Draw.Event.DELETED, (event: any) => {
        console.log('🗑️ ترسیم حذف شد:', event);
      });

      map.on((L as any).Draw.Event.EDITED, (event: any) => {
        console.log('✏️ ترسیم ویرایش شد:', event);
      });

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