// src/modules/mine/presentation/components/Map/index.tsx

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { ZoomControls } from './controls/ZoomControls';
import { useMapInteraction } from './hooks/useMapInteraction';

// ============================================
// تصحیح آیکون‌های Leaflet
// ============================================

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ============================================
// انواع لایه‌های زمینه
// ============================================

export type BaseMapType = 'none' | 'osm' | 'topo' | 'satellite';

// ============================================
// تنظیمات لایه‌ها
// ============================================

const BASE_MAPS = {
  osm: {
    name: 'نقشه خیابانی',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
    icon: '🗺️',
  },
  topo: {
    name: 'نقشه توپوگرافی',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
    icon: '⛰️',
  },
  satellite: {
    name: 'تصاویر ماهواره‌ای',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '© Google',
    icon: '🛰️',
  },
};

// ============================================
// Props
// ============================================

interface MapProps {
  geoData?: any;
  height?: string;
  backgroundColor?: string;
  onDrawComplete?: (feature: any) => void;
  onMeasureComplete?: (result: { type: string; value: number; unit: string }) => void;
  activeTool?: string;
  baseMapType?: BaseMapType;
  baseMapOpacity?: number;
}

// ============================================
// کامپوننت اصلی
// ============================================

export function Map({ 
  geoData, 
  height = '100%', 
  backgroundColor = '#0a1628',
  onDrawComplete,
  onMeasureComplete,
  activeTool = 'none',
  baseMapType = 'osm',
  baseMapOpacity = 0.8,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const bgLayerRef = useRef<any>(null);
  const baseMapLayerRef = useRef<any>(null);
  const geoDataLayerRef = useRef<any>(null);

  // ============================================
  // راه‌اندازی نقشه
  // ============================================

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('🗺️ ایجاد نقشه...');

    const map = L.map(mapRef.current, {
      center: [31.5, 54.3],
      zoom: 10,
      zoomControl: false,
    });

    // ============================================
    // لایه ۱: پس‌زمینه رنگی
    // ============================================
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 512, 512);
      
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
    }
    
    const bgLayer = L.tileLayer(canvas.toDataURL('image/png'), {
      tileSize: 512,
      minZoom: 0,
      maxZoom: 20,
      attribution: '',
      zIndex: 0,
    });
    bgLayer.addTo(map);
    bgLayerRef.current = bgLayer;

    // ============================================
    // لایه ۲: نقشه زمینه
    // ============================================
    
    if (baseMapType !== 'none') {
      const mapConfig = BASE_MAPS[baseMapType];
      if (mapConfig) {
        console.log(`🗺️ بارگذاری لایه: ${mapConfig.name}`);
        const layer = L.tileLayer(mapConfig.url, {
          attribution: mapConfig.attribution,
          maxZoom: 20,
          opacity: baseMapOpacity,
          zIndex: 1,
          crossOrigin: true,
        });
        layer.addTo(map);
        baseMapLayerRef.current = layer;
      }
    }

    mapInstanceRef.current = map;
    (window as any).__MAP_INSTANCE__ = map;

    setIsReady(true);
    console.log('✅ نقشه آماده شد');

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ============================================
  // بارگذاری داده GeoJSON (با مختصات WGS84)
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    console.log('📊 بارگذاری داده روی نقشه...');

    try {
      // حذف لایه قبلی
      if (geoDataLayerRef.current) {
        map.removeLayer(geoDataLayerRef.current);
        geoDataLayerRef.current = null;
      }

      console.log('📊 تعداد ویژگی‌ها:', geoData.features?.length || 0);

      // ✅ ایجاد لایه جدید با مختصات WGS84
      const layer = L.geoJSON(geoData, {
        style: {
          color: '#C9A227',
          weight: 3,
          fillColor: '#C9A227',
          fillOpacity: 0.2,
        },
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#C9A227',
            color: '#FFFFFF',
            weight: 2,
            fillOpacity: 0.9,
          });
        },
        // ✅ تبدیل مختصات [lng, lat] به [lat, lng] برای Leaflet
        coordsToLatLng: function(coords: any) {
          return L.latLng(coords[1], coords[0]);
        },
      }).addTo(map);
      
      geoDataLayerRef.current = layer;
      layer.setZIndex(10);

      // زوم روی داده‌ها
      setTimeout(() => {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
          console.log('✅ زوم روی داده‌ها انجام شد');
        }
      }, 300);
    } catch (error) {
      console.error('❌ خطا در بارگذاری داده:', error);
    }
  }, [geoData]);

  // ============================================
  // به‌روزرسانی رنگ پس‌زمینه
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (bgLayerRef.current) {
      map.removeLayer(bgLayerRef.current);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 512, 512);
      
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
    }
    
    const newBgLayer = L.tileLayer(canvas.toDataURL('image/png'), {
      tileSize: 512,
      minZoom: 0,
      maxZoom: 20,
      attribution: '',
      zIndex: 0,
    });
    newBgLayer.addTo(map);
    bgLayerRef.current = newBgLayer;

    if (baseMapLayerRef.current && map.hasLayer(baseMapLayerRef.current)) {
      baseMapLayerRef.current.setZIndex(1);
    }
  }, [backgroundColor]);

  // ============================================
  // به‌روزرسانی نقشه زمینه
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseMapLayerRef.current) {
      map.removeLayer(baseMapLayerRef.current);
      baseMapLayerRef.current = null;
    }

    if (baseMapType === 'none') {
      console.log('🗺️ نقشه زمینه مخفی شد');
      return;
    }

    const mapConfig = BASE_MAPS[baseMapType];
    if (!mapConfig) return;

    console.log(`🗺️ بارگذاری لایه: ${mapConfig.name}`);
    
    const layer = L.tileLayer(mapConfig.url, {
      attribution: mapConfig.attribution,
      maxZoom: 20,
      opacity: baseMapOpacity,
      zIndex: 1,
      crossOrigin: true,
    });
    layer.addTo(map);
    baseMapLayerRef.current = layer;
  }, [baseMapType]);

  // ============================================
  // به‌روزرسانی شفافیت
  // ============================================

  useEffect(() => {
    if (baseMapLayerRef.current) {
      baseMapLayerRef.current.setOpacity(baseMapOpacity);
    }
  }, [baseMapOpacity]);

  // ============================================
  // ابزارهای ترسیم
  // ============================================

  useMapInteraction({
    map: mapInstanceRef.current,
    activeTool,
    isReady,
    onDrawComplete,
    onMeasureComplete,
  });

  // ============================================
  // رندر
  // ============================================

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div
        ref={mapRef}
        className="w-full h-full rounded-xl overflow-hidden border border-[#AACCDD]/20"
        style={{
          minHeight: '500px',
          height: height,
        }}
      />

      {/* کنترل زوم */}
      <ZoomControls map={mapInstanceRef.current} className="absolute bottom-4 right-4 z-20" />

      {/* وضعیت ابزار */}
      {activeTool !== 'none' && activeTool !== 'select' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#C9A227]/20 backdrop-blur border border-[#C9A227]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#C9A227]">
              ✏️ {getToolLabel(activeTool)}
            </span>
          </div>
        </div>
      )}

      {/* نوع نقشه زمینه */}
      {baseMapType !== 'none' && (
        <div className="absolute top-4 right-4 z-10 px-2 py-1 rounded-lg text-[8px] bg-[#0A1628]/70 backdrop-blur border border-[#AACCDD]/20 text-[#4A6A8A]">
          {BASE_MAPS[baseMapType]?.icon} {BASE_MAPS[baseMapType]?.name}
        </div>
      )}
    </div>
  );
}

function getToolLabel(tool: string): string {
  const labels: Record<string, string> = {
    'point': 'رسم نقطه',
    'line': 'رسم خط',
    'polygon': 'رسم محدوده',
    'measureDistance': 'اندازه‌گیری فاصله',
    'measureArea': 'اندازه‌گیری مساحت',
  };
  return labels[tool] || tool;
}

export default Map;