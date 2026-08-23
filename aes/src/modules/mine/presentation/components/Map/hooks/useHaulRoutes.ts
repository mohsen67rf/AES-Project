// src/modules/mine/presentation/components/Map/hooks/useHaulRoutes.ts

import { useState, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { SubBlock } from '../../../../../../core/domain/types/mine.types';
import { SubBlockRepository } from '../../../../../../core/infrastructure/repositories';

export interface HaulRoute {
  id: string;
  subBlockId: string;
  subBlockCode: string;
  destination: string;
  coordinates: [number, number][]; // [lng, lat]
  distance: number; // متر
  duration: number; // دقیقه
  createdAt: string;
}

interface HaulRouteWithLayer extends HaulRoute {
  layer: any;
  animationLayer: any;
}

export function useHaulRoutes(map: any) {
  const [routes, setRoutes] = useState<HaulRouteWithLayer[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<HaulRouteWithLayer | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoints, setTempPoints] = useState<[number, number][]>([]);
  const [tempLine, setTempLine] = useState<any>(null);

  // ============================================
  // شروع رسم مسیر
  // ============================================

  const startDrawing = useCallback(() => {
    if (!map) return;
    setIsDrawing(true);
    setTempPoints([]);
    
    // تغییر کرسر
    map.getContainer().style.cursor = 'crosshair';
  }, [map]);

  // ============================================
  // توقف رسم مسیر
  // ============================================

  const stopDrawing = useCallback(() => {
    if (!map) return;
    setIsDrawing(false);
    if (tempLine) {
      map.removeLayer(tempLine);
      setTempLine(null);
    }
    map.getContainer().style.cursor = 'default';
  }, [map, tempLine]);

  // ============================================
  // افزودن نقطه به مسیر
  // ============================================

  const addPoint = useCallback((latlng: L.LatLng) => {
    if (!isDrawing || !map) return;

    const point: [number, number] = [latlng.lng, latlng.lat];
    const newPoints = [...tempPoints, point];
    setTempPoints(newPoints);

    // به‌روزرسانی خط موقت
    if (tempLine) {
      map.removeLayer(tempLine);
    }

    if (newPoints.length >= 2) {
      const latlngs = newPoints.map(p => [p[1], p[0]]);
      const newLine = L.polyline(latlngs as any, {
        color: '#C9A227',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
        className: 'haul-route-temp',
      }).addTo(map);
      
      setTempLine(newLine);

      // نمایش فاصله
      const distance = calculateDistance(newPoints);
      if (distance > 0) {
        const midPoint = getMidPoint(newPoints);
        const label = L.divIcon({
          html: `<div class="bg-[#1A2A3A]/80 text-[#C9A227] px-2 py-0.5 rounded text-[10px] font-mono border border-[#C9A227]/30">${distance.toFixed(0)}m</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });
        // افزودن لیبل به نقشه
        L.marker([midPoint[1], midPoint[0]], { icon: label, interactive: false })
          .addTo(map)
          .bindTooltip(`${distance.toFixed(0)} متر`);
      }
    }
  }, [isDrawing, map, tempPoints, tempLine]);

  // ============================================
  // محاسبه فاصله بین نقاط
  // ============================================

  const calculateDistance = (points: [number, number][]): number => {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const lat1 = p1[1];
      const lng1 = p1[0];
      const lat2 = p2[1];
      const lng2 = p2[0];
      const R = 6371000; // شعاع زمین به متر
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      total += R * c;
    }
    return total;
  };

  // ============================================
  // دریافت نقطه میانی
  // ============================================

  const getMidPoint = (points: [number, number][]): [number, number] => {
    if (points.length === 0) return [0, 0];
    if (points.length === 1) return points[0];
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    return [(prev[0] + last[0]) / 2, (prev[1] + last[1]) / 2];
  };

  // ============================================
  // تایید مسیر
  // ============================================

  const confirmRoute = useCallback((subBlockId: string, destination: string) => {
    if (!map || tempPoints.length < 2) return;

    const subBlock = SubBlockRepository.getById(subBlockId);
    if (!subBlock) return;

    const distance = calculateDistance(tempPoints);
    const duration = Math.round(distance / 20 / 60); // سرعت فرضی 20 کیلومتر بر ساعت

    const newRoute: HaulRoute = {
      id: crypto.randomUUID(),
      subBlockId: subBlock.id,
      subBlockCode: subBlock.code,
      destination,
      coordinates: [...tempPoints],
      distance,
      duration,
      createdAt: new Date().toISOString(),
    };

    // ایجاد لایه اصلی
    const latlngs = tempPoints.map(p => [p[1], p[0]]);
    
    // خط اصلی (با انیمیشن جریان)
    const mainLayer = L.polyline(latlngs as any, {
      color: '#C9A227',
      weight: 4,
      opacity: 0.6,
      className: 'haul-route-main',
    });

    // لایه انیمیشن (برای جریان بار)
    const animationLayer = L.polyline(latlngs as any, {
      color: '#C9A227',
      weight: 6,
      opacity: 0.3,
      dashArray: '5, 15',
      className: 'haul-route-animation',
    });

    // افزودن به نقشه
    mainLayer.addTo(map);
    animationLayer.addTo(map);

    // ذخیره در state
    const routeWithLayer: HaulRouteWithLayer = {
      ...newRoute,
      layer: mainLayer,
      animationLayer: animationLayer,
    };

    setRoutes(prev => [...prev, routeWithLayer]);

    // پاک کردن حالت رسم
    if (tempLine) {
      map.removeLayer(tempLine);
      setTempLine(null);
    }
    setTempPoints([]);
    setIsDrawing(false);
    map.getContainer().style.cursor = 'default';

    return routeWithLayer;
  }, [map, tempPoints, tempLine]);

  // ============================================
  // نمایش مسیر با هاور روی ساب‌بلوک
  // ============================================

  const showRouteForSubBlock = useCallback((subBlockId: string) => {
    // مخفی کردن همه مسیرها
    routes.forEach(route => {
      route.layer.setOpacity(0);
      route.animationLayer.setOpacity(0);
    });

    // پیدا کردن مسیر مربوطه
    const route = routes.find(r => r.subBlockId === subBlockId);
    if (route) {
      route.layer.setOpacity(1);
      route.animationLayer.setOpacity(1);
      setSelectedRoute(route);
      
      // زوم روی مسیر
      if (map) {
        const bounds = route.layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      }
    } else {
      setSelectedRoute(null);
    }
  }, [routes, map]);

  // ============================================
  // مخفی کردن همه مسیرها
  // ============================================

  const hideAllRoutes = useCallback(() => {
    routes.forEach(route => {
      route.layer.setOpacity(0);
      route.animationLayer.setOpacity(0);
    });
    setSelectedRoute(null);
  }, [routes]);

  // ============================================
  // حذف یک مسیر
  // ============================================

  const deleteRoute = useCallback((routeId: string) => {
    if (!map) return;
    const route = routes.find(r => r.id === routeId);
    if (route) {
      map.removeLayer(route.layer);
      map.removeLayer(route.animationLayer);
      setRoutes(prev => prev.filter(r => r.id !== routeId));
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(null);
      }
    }
  }, [routes, map, selectedRoute]);

  // ============================================
  // پاکسازی
  // ============================================

  useEffect(() => {
    return () => {
      // پاکسازی لایه‌ها هنگام unmount
      routes.forEach(route => {
        if (map) {
          map.removeLayer(route.layer);
          map.removeLayer(route.animationLayer);
        }
      });
    };
  }, [routes, map]);

  return {
    routes,
    selectedRoute,
    isDrawing,
    tempPoints,
    startDrawing,
    stopDrawing,
    addPoint,
    confirmRoute,
    showRouteForSubBlock,
    hideAllRoutes,
    deleteRoute,
    calculateDistance,
  };
}