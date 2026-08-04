// src/modules/mine/presentation/components/DrillingMap.tsx

import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { DrillingPoint } from '../types';

interface DrillingMapProps {
  points: DrillingPoint[];
  onPointClick: (point: DrillingPoint) => void;
  onDepthUpdate: (pointId: string, depth: number) => void;
}

export function DrillingMap({ points, onPointClick, onDepthUpdate }: DrillingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<DrillingPoint | null>(null);
  const [inputDepth, setInputDepth] = useState('');

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();

    points.forEach((point) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([point.location.x, point.location.y])),
        id: point.id,
        status: point.status,
        number: point.number,
        finalDepth: point.finalDepth || 0,
      });

      const color = getStatusColor(point.status);
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({ color: color }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
          }),
          text: new Text({
            text: String(point.number),
            font: '10px sans-serif',
            fill: new Fill({ color: '#fff' }),
            offsetY: -15,
          }),
        })
      );

      vectorSource.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({ source: vectorSource });

    const newMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([54.3, 31.5]),
        zoom: 10,
      }),
    });

    newMap.on('click', (event) => {
      const feature = newMap.forEachFeatureAtPixel(event.pixel, (f) => f);
      if (feature) {
        const id = feature.get('id');
        const point = points.find(p => p.id === id);
        if (point) {
          setSelectedPoint(point);
          onPointClick(point);
          setInputDepth(point.finalDepth?.toString() || '');
        }
      }
    });

    setMap(newMap);

    return () => newMap.setTarget(undefined);
  }, [points]);

  const handleDepthSubmit = () => {
    if (!selectedPoint || !inputDepth) return;
    const depth = parseFloat(inputDepth);
    if (isNaN(depth)) return;

    onDepthUpdate(selectedPoint.id, depth);
    setSelectedPoint(null);
    setInputDepth('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return '#3B82F6';
      case 'DRILLING': return '#F59E0B';
      case 'COMPLETED': return '#10B981';
      case 'COLLAPSED': return '#EF4444';
      case 'DEVIATED': return '#8B5CF6';
      default: return '#9CA3AF';
    }
  };

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="w-full h-96 rounded-xl overflow-hidden border border-[#AACCDD]/20" />

      {selectedPoint && (
        <div className="bg-[#13203A]/40 backdrop-blur-xl border border-[#AACCDD]/20 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-white font-medium">چال شماره {selectedPoint.number}</h4>
              <p className="text-[#8A9DB0] text-sm">
                عمق طراحی: {selectedPoint.designDepth} متر
                {selectedPoint.finalDepth && (
                  <span className="mr-4">
                    عمق فعلی: <span className="text-[#AACCDD]">{selectedPoint.finalDepth} متر</span>
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="number"
                value={inputDepth}
                onChange={(e) => setInputDepth(e.target.value)}
                placeholder="عمق جدید (متر)"
                className="w-40 px-3 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                step="0.1"
              />
              <button
                onClick={handleDepthSubmit}
                className="px-4 py-2 bg-[#AACCDD] text-[#1A2A3A] rounded-lg hover:bg-[#8A9DB0] transition-colors"
              >
                ثبت عمق
              </button>
              <button
                onClick={() => setSelectedPoint(null)}
                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>

          {selectedPoint.dailyProgress && selectedPoint.dailyProgress.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#AACCDD]/10">
              <h5 className="text-[#8A9DB0] text-sm mb-2">تاریخچه حفاری</h5>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedPoint.dailyProgress.map((day, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-[#4A6A8A]">{new Date(day.date).toLocaleDateString('fa-IR')}</span>
                    <span className="text-white">{day.depth} متر</span>
                    <span className="text-[#8A9DB0]">شیفت: {day.shift}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}