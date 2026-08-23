// src/modules/mine/presentation/components/Map/Map.tsx

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

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
// انواع
// ============================================

export type BaseMapType = 'none' | 'osm' | 'topo' | 'satellite';

interface MapProps {
  geoData?: any;
  height?: string;
  backgroundColor?: string;
  onDrawComplete?: (feature: any) => void;
  onMeasureComplete?: (result: any) => void;
  onFeatureSelect?: (featureId: string) => void;
  onMapReady?: (map: any) => void;
  activeTool?: string;
  baseMapType?: BaseMapType;
  baseMapOpacity?: number;
}

// ============================================
// کامپوننت تنظیمات نقشه
// ============================================

function MapContent({
  geoData,
  onDrawComplete,
  onMeasureComplete,
  onFeatureSelect,
  onMapReady,
  activeTool,
  baseMapType,
  baseMapOpacity,
}: any) {
  const map = useMap();
  const [isReady, setIsReady] = useState(false);
  const drawnItemsRef = useRef<any>(null);
  const drawControlRef = useRef<any>(null);

  // ============================================
  // ارسال Map به والد
  // ============================================

  useEffect(() => {
    if (map && !isReady) {
      setIsReady(true);
      if (onMapReady) {
        onMapReady(map);
      }
      console.log('✅ نقشه React-Leaflet آماده شد');
    }
  }, [map]);

  // ============================================
  // لایه نقشه زمینه
  // ============================================

  const getTileLayer = () => {
    const layers = {
      osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap',
      },
      topo: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap',
      },
      satellite: {
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        attribution: '© Google',
      },
    };

    if (baseMapType === 'none') return null;
    const layer = layers[baseMapType as keyof typeof layers];
    if (!layer) return null;

    return (
      <TileLayer
        url={layer.url}
        attribution={layer.attribution}
        opacity={baseMapOpacity || 0.8}
        zIndex={1}
      />
    );
  };

  // ============================================
  // مدیریت داده‌های GeoJSON
  // ============================================

  useEffect(() => {
    if (!map || !geoData) return;

    // حذف لایه‌های قبلی
    map.eachLayer((layer: any) => {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    // اگر داده وجود نداشت
    if (!geoData.features || geoData.features.length === 0) {
      console.log('ℹ️ داده‌های نقشه خالی هستند');
      return;
    }

    console.log('📊 بارگذاری داده روی نقشه... تعداد:', geoData.features.length);

    try {
      const layer = L.geoJSON(geoData, {
        style: {
          color: '#C9A227',
          weight: 3,
          fillColor: '#C9A227',
          fillOpacity: 0.2,
        },
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: '#C9A227',
            color: '#fff',
            weight: 2,
            fillOpacity: 0.9,
          });
        },
        onEachFeature: (feature, layer) => {
          if (feature?.properties?.name) {
            layer.bindPopup(`
              <div style="text-align:right; direction:rtl; padding:8px;">
                <strong>${feature.properties.name}</strong>
                ${feature.properties.description ? `<p style="font-size:12px;color:#666;">${feature.properties.description}</p>` : ''}
              </div>
            `);
          }
        },
      });

      layer.addTo(map);

      // زوم روی داده‌ها
      setTimeout(() => {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
          console.log('✅ زوم روی داده‌ها انجام شد');
        }
      }, 500);

    } catch (error) {
      console.error('❌ خطا در بارگذاری داده:', error);
    }
  }, [map, geoData]);

  // ============================================
  // ابزارهای ترسیم
  // ============================================

  useEffect(() => {
    if (!map) return;

    // حذف کنترل قبلی
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (activeTool === 'none' || activeTool === 'select') return;

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

        if (onDrawComplete) {
          onDrawComplete(geojson);
        }

        if (drawnItemsRef.current) {
          drawnItemsRef.current.addLayer(layer);
        }
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
  }, [map, activeTool]);

  // ============================================
  // دریافت تنظیمات ابزار
  // ============================================

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
            html: '<div style="background:#C9A227;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [12, 12],
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

  // ============================================
  // وضعیت ابزار
  // ============================================

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

  return (
    <>
      <ZoomControl position="bottomright" />

      {getTileLayer()}

      {geoData && geoData.features && geoData.features.length > 0 && (
        <GeoJSON
          data={geoData}
          style={{
            color: '#C9A227',
            weight: 3,
            fillColor: '#C9A227',
            fillOpacity: 0.2,
          }}
          pointToLayer={(feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: '#C9A227',
              color: '#fff',
              weight: 2,
              fillOpacity: 0.9,
            });
          }}
          onEachFeature={(feature, layer) => {
            if (feature?.properties?.name) {
              layer.bindPopup(`
                <div style="text-align:right; direction:rtl; padding:8px;">
                  <strong>${feature.properties.name}</strong>
                  ${feature.properties.description ? `<p style="font-size:12px;color:#666;">${feature.properties.description}</p>` : ''}
                </div>
              `);
            }
          }}
        />
      )}

      {/* وضعیت ابزار */}
      {activeTool !== 'none' && activeTool !== 'select' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#C9A227]/20 backdrop-blur border border-[#C9A227]/30 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-[#C9A227]">✏️ {getToolLabel(activeTool)}</span>
          </div>
        </div>
      )}
    </>
  );
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
  onFeatureSelect,
  onMapReady,
  activeTool = 'none',
  baseMapType = 'osm',
  baseMapOpacity = 0.8,
}: MapProps) {
  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <MapContainer
        center={[31.5, 54.3]}
        zoom={10}
        style={{ height: height, width: '100%', minHeight: '500px' }}
        className="rounded-xl overflow-hidden border border-[#AACCDD]/20"
        zoomControl={false}
        fadeAnimation={true}
      >
        <MapContent
          geoData={geoData}
          onDrawComplete={onDrawComplete}
          onMeasureComplete={onMeasureComplete}
          onFeatureSelect={onFeatureSelect}
          onMapReady={onMapReady}
          activeTool={activeTool}
          baseMapType={baseMapType}
          baseMapOpacity={baseMapOpacity}
        />
      </MapContainer>
    </div>
  );
}

export default Map;