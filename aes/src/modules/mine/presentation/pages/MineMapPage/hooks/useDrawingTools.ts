// src/modules/mine/presentation/pages/MineMapPage/hooks/useDrawingTools.ts

import { useState, useCallback } from 'react';
import { mapDatabase } from '../../../../../../core/infrastructure/database/MapDatabaseService';

export function useDrawingTools(
  mineId: string | undefined,
  geoData: any,
  setGeoData: (data: any) => void,
  setSelectedFeature: (feature: any) => void,
  setShowEdit: (show: boolean) => void
) {
  const [featureCounts, setFeatureCounts] = useState({
    points: 0,
    lines: 0,
    polygons: 0,
    measurements: 0,
  });

  const handleDrawComplete = useCallback(
    async (featureData: any) => {
      if (!mineId) return;
      try {
        const currentData = await mapDatabase.getMap(mineId);
        const features = currentData?.data?.features || [];

        features.push({
          type: 'Feature',
          geometry: featureData.geometry,
          properties: {
            ...featureData.properties,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        });

        const updatedData = {
          type: 'FeatureCollection' as const,
          features,
        };

        await mapDatabase.saveMap(mineId, updatedData);
        setGeoData(updatedData);

        const geomType = featureData.geometry.type;
        setFeatureCounts((prev) => ({
          ...prev,
          [geomType === 'Point'
            ? 'points'
            : geomType === 'LineString'
            ? 'lines'
            : 'polygons']:
            prev[
              geomType === 'Point'
                ? 'points'
                : geomType === 'LineString'
                ? 'lines'
                : 'polygons'
            ] + 1,
        }));

        console.log('✅ ترسیم ذخیره شد');
      } catch (error) {
        console.error('❌ خطا:', error);
      }
    },
    [mineId, setGeoData]
  );

  const handleMeasureComplete = useCallback((result: any) => {
    setFeatureCounts((prev) => ({
      ...prev,
      measurements: prev.measurements + 1,
    }));
  }, []);

  const handleFeatureSelect = useCallback(
    (featureId: string) => {
      if (geoData?.features) {
        const found = geoData.features.find(
          (f: any) => f.properties?.id === featureId
        );
        if (found) {
          setSelectedFeature(found);
          setShowEdit(true);
        }
      }
    },
    [geoData, setSelectedFeature, setShowEdit]
  );

  const handleFeatureUpdate = useCallback(
    async (featureId: string, updates: any) => {
      if (!mineId) return;

      try {
        const currentData = await mapDatabase.getMap(mineId);
        if (!currentData?.data) return;

        const features = currentData.data.features.map((f: any) => {
          if (f.properties?.id === featureId) {
            return {
              ...f,
              properties: {
                ...f.properties,
                ...updates,
              },
            };
          }
          return f;
        });

        const updatedData = {
          ...currentData.data,
          features,
        };

        await mapDatabase.saveMap(mineId, updatedData);
        setGeoData(updatedData);
        console.log('✅ ویژگی به‌روزرسانی شد');
      } catch (error) {
        console.error('❌ خطا:', error);
      }
    },
    [mineId, setGeoData]
  );

  const handleFeatureDelete = useCallback(
    async (featureId: string) => {
      if (!mineId) return;

      try {
        const currentData = await mapDatabase.getMap(mineId);
        if (!currentData?.data) return;

        const features = currentData.data.features.filter(
          (f: any) => f.properties?.id !== featureId
        );
        const updatedData = {
          ...currentData.data,
          features,
        };

        await mapDatabase.saveMap(mineId, updatedData);
        setGeoData(updatedData);

        const remainingFeatures = features || [];
        setFeatureCounts({
          points: remainingFeatures.filter((f: any) => f.geometry?.type === 'Point')
            .length,
          lines: remainingFeatures.filter((f: any) => f.geometry?.type === 'LineString')
            .length,
          polygons: remainingFeatures.filter((f: any) => f.geometry?.type === 'Polygon')
            .length,
          measurements: 0,
        });

        console.log('✅ ویژگی حذف شد');
      } catch (error) {
        console.error('❌ خطا:', error);
      }
    },
    [mineId, setGeoData]
  );

  return {
    featureCounts,
    setFeatureCounts,
    handleDrawComplete,
    handleMeasureComplete,
    handleFeatureSelect,
    handleFeatureUpdate,
    handleFeatureDelete,
  };
}