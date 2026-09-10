// src/modules/mine/presentation/hooks/useActiveMasterSurveyMap.ts

import { useState, useEffect, useCallback } from 'react';
import type { SurveyMap } from '../../../../core/domain/types/survey-map.types';
import { SurveyMapService } from '../../services/SurveyMapService';

export function useActiveMasterSurveyMap() {
  const [masterMap, setMasterMap] = useState<SurveyMap | null>(() => SurveyMapService.getActiveMasterMap());
  const [masterMapId, setMasterMapId] = useState<string>(() => SurveyMapService.getActiveMasterMapId());
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [hasNewUpdateAlert, setHasNewUpdateAlert] = useState<boolean>(false);
  const [updateDetails, setUpdateDetails] = useState<{ publishedBy?: string; timestamp?: string; version?: string } | null>(null);

  const refreshMasterMap = useCallback(() => {
    const active = SurveyMapService.getActiveMasterMap();
    if (active) {
      setMasterMap(active);
      setMasterMapId(active.id);
      setLastSyncTime(new Date());
      setHasNewUpdateAlert(false);
    }
  }, []);

  const setAsActiveMaster = useCallback((mapId: string, role: string = 'SUPERVISION', name: string = 'مهندس نقشه‌برداری') => {
    const updated = SurveyMapService.setActiveMasterMap(mapId, role, name);
    if (updated) {
      setMasterMap(updated);
      setMasterMapId(updated.id);
      setLastSyncTime(new Date());
      setHasNewUpdateAlert(false);
    }
    return updated;
  }, []);

  useEffect(() => {
    // عضویت در رویدادهای تغییر نقشه مرجع در سراسر سامانه
    const unsubscribe = SurveyMapService.subscribeToMasterMapUpdates((updatedMap) => {
      setMasterMap(updatedMap);
      setMasterMapId(updatedMap.id);
      setLastSyncTime(new Date());
      setHasNewUpdateAlert(true);
    });

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ mapId: string; map: SurveyMap; publishedBy?: string; timestamp?: string }>;
      if (customEvent.detail?.map) {
        setMasterMap(customEvent.detail.map);
        setMasterMapId(customEvent.detail.map.id);
        setLastSyncTime(new Date());
        setHasNewUpdateAlert(true);
        setUpdateDetails({
          publishedBy: customEvent.detail.publishedBy || 'واحد نقشه‌برداری',
          timestamp: customEvent.detail.timestamp,
          version: customEvent.detail.map.version
        });
      }
    };

    window.addEventListener(SurveyMapService.MASTER_MAP_EVENT, handleCustomUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener(SurveyMapService.MASTER_MAP_EVENT, handleCustomUpdate);
    };
  }, []);

  const dismissUpdateAlert = useCallback(() => {
    setHasNewUpdateAlert(false);
  }, []);

  return {
    masterMap,
    masterMapId,
    lastSyncTime,
    hasNewUpdateAlert,
    updateDetails,
    refreshMasterMap,
    setAsActiveMaster,
    dismissUpdateAlert
  };
}
