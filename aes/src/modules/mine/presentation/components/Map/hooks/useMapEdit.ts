// src/modules/mine/presentation/components/Map/hooks/useMapEdit.ts

import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';

interface UseMapEditProps {
  map: any;
  onFeatureUpdate?: (featureId: string, newData: any) => void;
  onFeatureDelete?: (featureId: string) => void;
}

export function useMapEdit({ map, onFeatureUpdate, onFeatureDelete }: UseMapEditProps) {
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const editLayerRef = useRef<any>(null);

  // ============================================
  // انتخاب ویژگی روی نقشه
  // ============================================

  const selectFeature = useCallback((featureId: string) => {
    if (!map) return;

    // حذف هایلایت قبلی
    if (editLayerRef.current) {
      map.removeLayer(editLayerRef.current);
      editLayerRef.current = null;
    }

    // پیدا کردن ویژگی
    let foundFeature: any = null;
    
    map.eachLayer((layer: any) => {
      if (layer.feature && layer.feature.properties?.id === featureId) {
        foundFeature = {
          id: featureId,
          type: layer.feature.geometry?.type === 'Point' ? 'point' :
                layer.feature.geometry?.type === 'LineString' ? 'line' : 'polygon',
          layer: layer,
          properties: layer.feature.properties || {},
        };
      }
    });

    if (foundFeature) {
      // هایلایت کردن
      const highlightStyle = {
        color: '#C9A227',
        weight: 4,
        opacity: 1,
        fillColor: '#C9A227',
        fillOpacity: 0.3,
        dashArray: '5, 5',
      };

      if (foundFeature.layer.toGeoJSON) {
        const highlightLayer = L.geoJSON(foundFeature.layer.toGeoJSON(), {
          style: highlightStyle,
        }).addTo(map);
        editLayerRef.current = highlightLayer;
      }
      
      setSelectedFeature(foundFeature);
      setIsEditing(true);
    } else {
      setSelectedFeature(null);
      setIsEditing(false);
    }
  }, [map]);

  // ============================================
  // ویرایش ویژگی
  // ============================================

  const updateFeature = useCallback((featureId: string, updates: any) => {
    if (!map || !onFeatureUpdate) return;

    // پیدا کردن لایه
    map.eachLayer((layer: any) => {
      if (layer.feature && layer.feature.properties?.id === featureId) {
        // به‌روزرسانی properties
        layer.feature.properties = {
          ...layer.feature.properties,
          ...updates,
        };
        
        // به‌روزرسانی استایل
        if (updates.style && layer.setStyle) {
          layer.setStyle(updates.style);
        }
        
        onFeatureUpdate(featureId, layer.feature);
      }
    });

    // به‌روزرسانی هایلایت
    if (editLayerRef.current) {
      map.removeLayer(editLayerRef.current);
      editLayerRef.current = null;
      
      // هایلایت مجدد با استایل جدید
      map.eachLayer((layer: any) => {
        if (layer.feature && layer.feature.properties?.id === featureId && layer.toGeoJSON) {
          const highlightLayer = L.geoJSON(layer.toGeoJSON(), {
            style: {
              color: '#C9A227',
              weight: 4,
              opacity: 1,
              fillColor: '#C9A227',
              fillOpacity: 0.3,
              dashArray: '5, 5',
            },
          }).addTo(map);
          editLayerRef.current = highlightLayer;
        }
      });
    }

    setSelectedFeature(null);
    setIsEditing(false);
  }, [map, onFeatureUpdate]);

  // ============================================
  // حذف ویژگی
  // ============================================

  const deleteFeature = useCallback((featureId: string) => {
    if (!map || !onFeatureDelete) return;

    let layerToRemove: any = null;
    
    map.eachLayer((layer: any) => {
      if (layer.feature && layer.feature.properties?.id === featureId) {
        layerToRemove = layer;
      }
    });

    if (layerToRemove) {
      map.removeLayer(layerToRemove);
      if (editLayerRef.current) {
        map.removeLayer(editLayerRef.current);
        editLayerRef.current = null;
      }
      onFeatureDelete(featureId);
      setSelectedFeature(null);
      setIsEditing(false);
    }
  }, [map, onFeatureDelete]);

  // ============================================
  // پاک کردن انتخاب
  // ============================================

  const clearSelection = useCallback(() => {
    if (editLayerRef.current) {
      map?.removeLayer(editLayerRef.current);
      editLayerRef.current = null;
    }
    setSelectedFeature(null);
    setIsEditing(false);
  }, [map]);

  return {
    selectedFeature,
    isEditing,
    selectFeature,
    updateFeature,
    deleteFeature,
    clearSelection,
  };
}