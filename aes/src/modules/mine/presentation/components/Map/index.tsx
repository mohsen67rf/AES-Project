// src/modules/mine/presentation/components/Map/index.tsx

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { ZoomControls } from './controls/ZoomControls';

// ============================================
// تصحیح آیکون‌های Leaflet
// ============================================

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export type BaseMapType = 'none' | 'osm' | 'topo' | 'satellite';

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

interface MapProps {
  geoData?: any;
  height?: string;
  backgroundColor?: string;
  onDrawComplete?: (feature: any) => void;
  onMeasureComplete?: (result: { type: string; value: number; unit: string }) => void;
  onFeatureSelect?: (featureId: string) => void;
  onMapReady?: (map: any) => void;
  activeTool?: string;
  baseMapType?: BaseMapType;
  baseMapOpacity?: number;
  selectedFeatureId?: string | null;
  onLayerStyleChange?: (layerName: string, style: any) => void;
}

export function Map({
  geoData,
  height = '100%',
  backgroundColor = '#0a1628',
  onDrawComplete,
  onMeasureComplete,
  onFeatureSelect,
  onMapReady,
  activeTool = 'none',
  baseMapType = 'osm',
  baseMapOpacity = 0.8,
  selectedFeatureId = null,
  onLayerStyleChange,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const bgLayerRef = useRef<any>(null);
  const baseMapLayerRef = useRef<any>(null);
  const geoDataLayerRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const drawControlRef = useRef<any>(null);
  const highlightLayerRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const [layers, setLayers] = useState<Record<string, any>>({});

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
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
    });

    // لایه پس‌زمینه
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

    // نقشه زمینه
    if (baseMapType !== 'none') {
      const mapConfig = BASE_MAPS[baseMapType];
      if (mapConfig) {
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

    // لایه ترسیمات
    drawnItemsRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;
    (window as any).__MAP_INSTANCE__ = map;

    if (onMapReady) {
      onMapReady(map);
    }

    setIsReady(true);
    console.log('✅ نقشه آماده شد');

    return () => {
      isMountedRef.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ============================================
  // به‌روزرسانی رنگ پس‌زمینه
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isReady) return;

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
  }, [backgroundColor, isReady]);

  // ============================================
  // به‌روزرسانی نقشه زمینه
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isReady) return;

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

    const layer = L.tileLayer(mapConfig.url, {
      attribution: mapConfig.attribution,
      maxZoom: 20,
      opacity: baseMapOpacity,
      zIndex: 1,
      crossOrigin: true,
    });
    layer.addTo(map);
    baseMapLayerRef.current = layer;
  }, [baseMapType, isReady]);

  // ============================================
  // به‌روزرسانی شفافیت
  // ============================================

  useEffect(() => {
    if (baseMapLayerRef.current) {
      baseMapLayerRef.current.setOpacity(baseMapOpacity);
    }
  }, [baseMapOpacity]);

  // ============================================
  // بارگذاری داده GeoJSON با پشتیبانی از لایه‌ها
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData || !isReady) return;

    console.log('📊 بارگذاری داده روی نقشه... تعداد:', geoData.features?.length || 0);

    // حذف لایه قبلی
    if (geoDataLayerRef.current) {
      try {
        map.removeLayer(geoDataLayerRef.current);
      } catch (e) {
        console.warn('⚠️ خطا در حذف لایه قبلی:', e);
      }
      geoDataLayerRef.current = null;
    }

    // حذف هایلایت قبلی
    if (highlightLayerRef.current) {
      try {
        map.removeLayer(highlightLayerRef.current);
      } catch (e) {}
      highlightLayerRef.current = null;
    }

    if (!geoData.features || geoData.features.length === 0) {
      console.log('ℹ️ داده‌های نقشه خالی هستند');
      return;
    }

    try {
      // گروه‌بندی ویژگی‌ها بر اساس لایه
      const layersMap: Record<string, any[]> = {};
      geoData.features.forEach((feature: any) => {
        const layerName = feature.properties?.layer || feature.properties?.Layer || 'default';
        if (!layersMap[layerName]) {
          layersMap[layerName] = [];
        }
        layersMap[layerName].push(feature);
      });

      console.log('📊 لایه‌های شناسایی شده:', Object.keys(layersMap));

      const machineIcons: Record<string, string> = {
        excavator: '🚜',
        truck: '🚛',
        drill: '⛰️',
        loader: '🛠️',
        crane: '🏗️',
        bulldozer: '🚧',
        dump: '🪨',
        conveyor: '⚙️',
      };

      // ایجاد لایه‌های جداگانه برای هر لایه
      const layerGroup = L.layerGroup();

      Object.entries(layersMap).forEach(([layerName, features]) => {
        const layerData = {
          type: 'FeatureCollection',
          features: features,
        };

        // تنظیمات پیش‌فرض بر اساس نام لایه
        const defaultStyle = getLayerDefaultStyle(layerName);

        const subLayer = L.geoJSON(layerData, {
          style: (feature) => {
            const props = feature?.properties || {};
            return {
              color: props.color || defaultStyle.color || '#C9A227',
              weight: props.weight || defaultStyle.weight || 3,
              fillColor: props.fillColor || defaultStyle.fillColor || props.color || '#C9A227',
              fillOpacity: props.fillOpacity || defaultStyle.fillOpacity || 0.2,
              dashArray: props.dashArray || defaultStyle.dashArray || '',
            };
          },
          pointToLayer: (feature, latlng) => {
            const props = feature?.properties || {};
            const size = props.size || 8;
            const color = props.color || defaultStyle.color || '#C9A227';
            const shape = props.shape || 'circle';

            let html = '';
            const iconSize = size * 2;

            switch (shape) {
              case 'square':
                html = `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`;
                break;
              case 'triangle':
                html = `<div style="width:0;height:0;border-left:${size}px solid transparent;border-right:${size}px solid transparent;border-bottom:${size * 1.5}px solid ${color};filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></div>`;
                break;
              case 'star':
                html = `<div style="color:${color};font-size:${size * 2}px;text-shadow:0 2px 4px rgba(0,0,0,0.3);">★</div>`;
                break;
              case 'diamond':
                html = `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;transform:rotate(45deg);box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`;
                break;
              default:
                html = `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`;
            }

            const icon = props.icon;
            if (icon && machineIcons[icon]) {
              html = `<div style="font-size:${size * 2}px;text-shadow:0 2px 4px rgba(0,0,0,0.3);">${machineIcons[icon]}</div>`;
            }

            return L.marker(latlng, {
              icon: L.divIcon({
                className: 'custom-marker',
                html,
                iconSize: [iconSize, iconSize],
                iconAnchor: [size, size],
              }),
            });
          },
          onEachFeature: (feature, layer) => {
            // ذخیره نام لایه در feature
            if (!feature.properties) feature.properties = {};
            feature.properties._layerName = layerName;

            if (feature?.properties?.id && onFeatureSelect) {
              layer.on('click', (e: any) => {
                e.originalEvent.stopPropagation();
                onFeatureSelect(feature.properties.id);
              });
            }

            if (feature?.properties?.name) {
              layer.bindPopup(`
                <div style="text-align:right; direction:rtl; padding:8px; max-width:200px;">
                  <strong>${feature.properties.name}</strong>
                  ${feature.properties.description ? `<p style="font-size:12px;color:#666;margin-top:4px;">${feature.properties.description}</p>` : ''}
                  ${feature.properties.layer ? `<p style="font-size:10px;color:#999;margin-top:4px;">لایه: ${feature.properties.layer}</p>` : ''}
                  ${feature.properties._layerName ? `<p style="font-size:10px;color:#999;margin-top:4px;">لایه: ${feature.properties._layerName}</p>` : ''}
                </div>
              `);
            }
          },
        });

        // ذخیره لایه در state برای دسترسی بعدی
        layers[layerName] = subLayer;
        layerGroup.addLayer(subLayer);
      });

      setLayers(layers);
      geoDataLayerRef.current = layerGroup;
      layerGroup.addTo(map);

      // زوم روی داده‌ها
      setTimeout(() => {
        if (!isMountedRef.current || !mapInstanceRef.current) return;
        try {
          const bounds = layerGroup.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
            console.log('✅ زوم روی داده‌ها انجام شد');
          }
        } catch (e) {
          console.warn('⚠️ خطا در زوم:', e);
        }
      }, 500);
    } catch (error) {
      console.error('❌ خطا در بارگذاری داده:', error);
    }
  }, [geoData, onFeatureSelect, isReady]);

  // ============================================
  // هایلایت کردن ویژگی انتخاب شده
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isReady) return;

    // حذف هایلایت قبلی
    if (highlightLayerRef.current) {
      try {
        map.removeLayer(highlightLayerRef.current);
      } catch (e) {}
      highlightLayerRef.current = null;
    }

    if (!selectedFeatureId || !geoDataLayerRef.current) return;

    // پیدا کردن ویژگی انتخاب شده
    let selectedFeature = null;
    geoDataLayerRef.current.eachLayer((layer: any) => {
      if (layer.feature?.properties?.id === selectedFeatureId) {
        selectedFeature = layer;
      }
    });

    if (selectedFeature) {
      // ایجاد لایه هایلایت با opacity کمتر
      const highlightStyle = {
        color: '#00D4FF',
        weight: 4,
        opacity: 0.8,
        fillColor: '#00D4FF',
        fillOpacity: 0.1,
        dashArray: '5, 5',
      };

      const highlightLayer = L.geoJSON(selectedFeature.toGeoJSON(), {
        style: highlightStyle,
      });

      highlightLayer.addTo(map);
      highlightLayerRef.current = highlightLayer;
      highlightLayer.setZIndex(20);

      // زوم روی ویژگی انتخاب شده
      try {
        const bounds = highlightLayer.getBounds();
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 18 });
        } else {
          const center = highlightLayer.getBounds().getCenter();
          if (center) {
            map.setView(center, 16);
          }
        }
      } catch (e) {
        console.warn('⚠️ خطا در زوم روی ویژگی:', e);
      }
    }
  }, [selectedFeatureId, isReady]);

  // ============================================
  // ابزارهای ترسیم
  // ============================================

  useEffect(() => {
    const map = mapInstanceRef.current;
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
  }, [mapInstanceRef.current, activeTool, isReady]);

  // ============================================
  // توابع کمکی
  // ============================================

  const getLayerDefaultStyle = (layerName: string) => {
    const styles: Record<string, any> = {
      'toe': { color: '#FF6B6B', weight: 2, dashArray: '' },
      'crest': { color: '#C9A227', weight: 2, dashArray: '' },
      'bench': { color: '#4ECDC4', weight: 2, dashArray: '' },
      'boundary': { color: '#FF9F43', weight: 3, dashArray: '5,5' },
      'road': { color: '#A29BFE', weight: 2, dashArray: '' },
      'default': { color: '#C9A227', weight: 2, dashArray: '' },
    };
    return styles[layerName.toLowerCase()] || styles.default;
  };

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

  const getToolLabel = (tool: string): string => {
    const labels: Record<string, string> = {
      point: 'رسم نقطه',
      line: 'رسم خط',
      polygon: 'رسم محدوده',
      measureDistance: 'اندازه‌گیری فاصله',
      measureArea: 'اندازه‌گیری مساحت',
    };
    return labels[tool] || tool;
  };

  // ============================================
  // رندر
  // ============================================

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div
        ref={mapRef}
        className="w-full h-full rounded-xl overflow-hidden border border-[#AACCDD]/20"
        style={{ minHeight: '500px', height }}
      />

      <ZoomControls map={mapInstanceRef.current} className="absolute bottom-4 right-4 z-20" />

      {activeTool !== 'none' && activeTool !== 'select' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#C9A227]/20 backdrop-blur border border-[#C9A227]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#C9A227]">✏️ {getToolLabel(activeTool)}</span>
          </div>
        </div>
      )}

      {activeTool === 'select' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#00D4FF]/20 backdrop-blur border border-[#00D4FF]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#00D4FF]">👆 روی ترسیم مورد نظر کلیک کنید</span>
          </div>
        </div>
      )}

      {selectedFeatureId && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#00D4FF]/20 backdrop-blur border border-[#00D4FF]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#00D4FF]">✅ یک ترسیم انتخاب شده است</span>
          </div>
        </div>
      )}

      {baseMapType !== 'none' && (
        <div className="absolute top-4 right-4 z-10 px-2 py-1 rounded-lg text-[8px] bg-[#0A1628]/70 backdrop-blur border border-[#AACCDD]/20 text-[#4A6A8A]">
          {BASE_MAPS[baseMapType]?.icon} {BASE_MAPS[baseMapType]?.name}
        </div>
      )}
    </div>
  );
}

export default Map;