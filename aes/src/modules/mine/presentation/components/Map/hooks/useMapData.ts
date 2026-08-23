// src/modules/mine/presentation/pages/MineMapPage/hooks/useMapData.ts

import { useState, useEffect, useCallback } from 'react';
import { mapDatabase } from '../../../../../../core/infrastructure/database/MapDatabaseService';
import { MineRepository, PitRepository } from '../../../../../../core/infrastructure/repositories';
import type { Mine, Pit } from '../../../../../../core/domain/types/mine.types';

export function useMapData(mineId: string | undefined) {
  const [mine, setMine] = useState<Mine | null>(null);
  const [pits, setPits] = useState<Pit[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const clearDefaultData = useCallback(async () => {
    try {
      await mapDatabase.clearAllMaps();
      console.log('🗑️ همه داده‌های پیش‌فرض پاک شدند');
    } catch (error) {
      console.error('❌ خطا در پاک کردن داده‌های پیش‌فرض:', error);
    }
  }, []);

  const loadMapData = useCallback(
    async (selectedPitId: string | null) => {
      if (!mineId) {
        console.warn('⚠️ loadMapData: mineId وجود ندارد');
        setLoading(false);
        return;
      }

      console.log(`📥 loadMapData: selectedPitId=${selectedPitId}`);

      try {
        let data = null;
        let source = '';

        if (selectedPitId) {
          const pitMap = await mapDatabase.getPitMap(selectedPitId);
          if (pitMap && pitMap.data && pitMap.data.features && pitMap.data.features.length > 0) {
            data = pitMap.data;
            source = `پیت ${selectedPitId}`;
            console.log(`✅ نقشه پیت از دیتابیس Load شد`);
          } else {
            console.log(`ℹ️ هیچ نقشه‌ای برای پیت ${selectedPitId} یافت نشد`);
          }
        } else {
          const mineMap = await mapDatabase.getMap(mineId);
          if (mineMap && mineMap.data && mineMap.data.features && mineMap.data.features.length > 0) {
            data = mineMap.data;
            source = 'معدن';
            console.log('✅ نقشه معدن از دیتابیس Load شد');
          } else {
            console.log('ℹ️ هیچ نقشه‌ای برای معدن یافت نشد');
          }
        }

        if (data && data.features && data.features.length > 0) {
          setGeoData(data);
          console.log(`✅ داده ${source} تنظیم شد، تعداد:`, data.features.length);
        } else {
          setGeoData(null);
          console.log('ℹ️ داده‌ای برای نمایش وجود ندارد');
        }
      } catch (error) {
        console.error('❌ خطا در بارگذاری نقشه:', error);
        setGeoData(null);
      } finally {
        setLoading(false);
      }
    },
    [mineId]
  );

  const loadMineAndPits = useCallback(() => {
    if (!mineId) {
      console.warn('⚠️ loadMineAndPits: mineId وجود ندارد');
      return;
    }

    console.log(`📥 loadMineAndPits: mineId=${mineId}`);

    try {
      const mineData = MineRepository.getById(mineId);
      setMine(mineData);

      const pitsData = PitRepository.findBy('mineId', mineId);
      console.log(`📋 تعداد پیت‌ها:`, pitsData.length);
      setPits(pitsData);
    } catch (error) {
      console.error('❌ خطا در بارگذاری معدن و پیت‌ها:', error);
    }
  }, [mineId]);

  const uploadMap = useCallback(
    async (data: any) => {
      if (!mineId) {
        console.warn('⚠️ uploadMap: mineId وجود ندارد');
        return false;
      }
      
      try {
        console.log('📤 uploadMap: شروع ذخیره‌سازی نقشه معدن...');
        
        let geoJsonData;
        if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
          geoJsonData = data;
        } else if (data.features) {
          geoJsonData = {
            type: 'FeatureCollection',
            features: data.features,
          };
        } else {
          geoJsonData = {
            type: 'FeatureCollection',
            features: [data],
          };
        }

        if (!geoJsonData.features || geoJsonData.features.length === 0) {
          console.warn('⚠️ داده‌های نقشه خالی هستند');
          return false;
        }

        console.log(`📤 ذخیره نقشه معدن در دیتابیس... (${geoJsonData.features.length} ویژگی)`);
        await mapDatabase.saveMap(mineId, geoJsonData);
        
        console.log('📤 به‌روزرسانی state...');
        setGeoData(geoJsonData);
        
        console.log('✅ نقشه معدن ذخیره شد');
        return true;
      } catch (error) {
        console.error('❌ خطا در uploadMap:', error);
        return false;
      }
    },
    [mineId, setGeoData]
  );

  const uploadPitMap = useCallback(
    async (data: any, pitId: string, pitName: string) => {
      try {
        console.log(`📤 uploadPitMap: شروع ذخیره‌سازی نقشه پیت ${pitName}...`);
        console.log('📤 pitId:', pitId);
        console.log('📤 داده ورودی:', data);
        
        let geoJsonData;
        if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
          geoJsonData = data;
        } else if (data.features) {
          geoJsonData = {
            type: 'FeatureCollection',
            features: data.features,
          };
        } else {
          geoJsonData = {
            type: 'FeatureCollection',
            features: [data],
          };
        }

        console.log(`📤 تعداد ویژگی‌ها:`, geoJsonData.features?.length || 0);

        if (!geoJsonData.features || geoJsonData.features.length === 0) {
          console.warn('⚠️ داده‌های نقشه پیت خالی هستند');
          return false;
        }

        console.log(`📤 ذخیره در دیتابیس با کلید: pit_${pitId}`);
        await mapDatabase.savePitMap(pitId, geoJsonData, `نقشه ${pitName}`, mineId || undefined);
        
        console.log('📤 به‌روزرسانی state...');
        setGeoData(geoJsonData);
        
        console.log(`✅ نقشه پیت ${pitName} ذخیره و نمایش داده شد`);
        console.log('📊 geoData جدید:', geoJsonData);
        
        return true;
      } catch (error) {
        console.error(`❌ خطا در uploadPitMap:`, error);
        return false;
      }
    },
    [mineId, setGeoData]
  );

  const clearMap = useCallback(async () => {
    if (!mineId) return;
    try {
      await mapDatabase.clearMap(mineId);
      setGeoData(null);
      console.log('🗑️ نقشه معدن پاک شد');
    } catch (error) {
      console.error('❌ خطا:', error);
    }
  }, [mineId]);

  return {
    mine,
    pits,
    geoData,
    setGeoData,
    loading,
    setLoading,
    loadMapData,
    loadMineAndPits,
    uploadMap,
    uploadPitMap,
    clearMap,
    clearDefaultData,
  };
}