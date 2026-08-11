// src/modules/mine/presentation/components/Map/hooks/useMapLayers.ts

import { useState, useCallback } from 'react';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  type: 'base' | 'overlay';
  layer?: any;
}

export function useMapLayers(map: any) {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'geoJson', name: 'داده‌های معدنی', visible: true, type: 'overlay' },
    { id: 'drilling', name: 'نقاط حفاری', visible: true, type: 'overlay' },
    { id: 'blocks', name: 'بلوک‌ها', visible: true, type: 'overlay' },
  ]);

  const addLayer = useCallback((layer: Layer) => {
    setLayers(prev => [...prev, layer]);
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  }, []);

  const toggleLayer = useCallback((id: string) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
  }, []);

  const getLayerVisibility = useCallback((id: string) => {
    return layers.find(l => l.id === id)?.visible ?? false;
  }, [layers]);

  return { layers, addLayer, removeLayer, toggleLayer, getLayerVisibility };
}