// src/modules/mine/presentation/components/SurveyMapStudio/SurveyMapStudio.tsx

import React, { useState, useEffect, useMemo } from 'react';
import type { 
  SurveyMap, 
  MapFeature, 
  MapLayer 
} from '../../../../../core/domain/types/survey-map.types';
import type { StakeholderRole } from '../../../../../core/domain/types/mine.types';
import { SurveyMapService } from '../../../services/SurveyMapService';
import { SurveyPermissionService } from '../../../services/SurveyPermissionService';
import { MapCanvasEditor, ActiveToolType } from './MapCanvasEditor';
import { DisplayOverlaySettings } from './MapLayersControlPanel';
import { AutoCadPropertiesPanel } from './AutoCadPropertiesPanel';
import { MapImportModal } from './MapImportModal';
import { FeatureEditModal } from './FeatureEditModal';
import { PermissionsMatrixModal } from './PermissionsMatrixModal';
import { MapExportModal } from './MapExportModal';

import {
  MapIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  CursorArrowRaysIcon,
  Square2StackIcon,
  SparklesIcon,
  ClockIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
  AdjustmentsVerticalIcon,
  HandRaisedIcon,
  ScaleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface SurveyMapStudioProps {
  initialMapId?: string;
  activeMapId?: string;
  onMapChange?: (mapId: string) => void;
  userRole?: StakeholderRole;
  userName?: string;
  isFullScreenMode?: boolean;
  onToggleFullScreen?: () => void;
}

export function SurveyMapStudio({
  initialMapId,
  activeMapId: externalActiveMapId,
  onMapChange,
  userRole = 'SUPERVISION',
  userName = 'مهندس مرادی (واحد نقشه‌برداری)',
  isFullScreenMode = false,
  onToggleFullScreen
}: SurveyMapStudioProps) {
  // نقش جاری در سامانه
  const [activeRole, setActiveRole] = useState<StakeholderRole>(userRole);
  const [activeUserName, setActiveUserName] = useState<string>(userName);

  // نقشه‌های موجود در سامانه
  const [mapsList, setMapsList] = useState<SurveyMap[]>([]);
  const [internalActiveMapId, setInternalActiveMapId] = useState<string>('');

  const currentActiveMapId = externalActiveMapId || internalActiveMapId;

  // ابزار فعال ترسیم
  const [activeTool, setActiveTool] = useState<ActiveToolType>('SELECT');
  
  // المان انتخاب شده روی نقشه
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);

  // وضعیت باز بودن پنل مشخصات اتوکد در سمت چپ
  const [isPropertiesOpen, setIsPropertiesOpen] = useState<boolean>(true);

  // وضعیت باز بودن مودال‌ها
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [internalFullScreen, setInternalFullScreen] = useState<boolean>(false);
  const [featureToDelete, setFeatureToDelete] = useState<MapFeature | null>(null);

  // پیام اعلان و موفقیت
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // تنظیمات بصری اورلی و نمایش شبکه/تراز/برچسب‌ها
  const [displaySettings, setDisplaySettings] = useState<DisplayOverlaySettings>({
    showCadGrid: true,
    showContourLines: true,
    showLabels: true,
    showLineLabels: false,         // برچسب خطوط پله پیش‌فرض خاموش جهت خلوت بودن نقشه
    showSubBlockLabels: true,
    showPointLabels: true,
    showGradeValues: true,
    showLegend: true
  });

  // بررسی دسترسی‌های کاربر فعال
  const permissions = useMemo(() => {
    return SurveyPermissionService.getPermissions(activeRole);
  }, [activeRole]);

  // بارگذاری لیست نقشه‌ها
  const refreshMaps = () => {
    const all = SurveyMapService.getAllMaps();
    setMapsList(all);
    if (!currentActiveMapId && all.length > 0) {
      const defaultId = initialMapId || all[0].id;
      setInternalActiveMapId(defaultId);
      if (onMapChange) onMapChange(defaultId);
    }
  };

  useEffect(() => {
    refreshMaps();
  }, []);

  // همگام‌سازی نقشه خارجی
  useEffect(() => {
    if (externalActiveMapId) {
      setInternalActiveMapId(externalActiveMapId);
    }
  }, [externalActiveMapId]);

  // اگر المانی انتخاب شد، پنل مشخصات باز شود
  useEffect(() => {
    if (selectedFeature) {
      setIsPropertiesOpen(true);
    }
  }, [selectedFeature]);

  // نقشه فعال
  const currentMap = useMemo(() => {
    return mapsList.find(m => m.id === currentActiveMapId) || mapsList[0] || null;
  }, [mapsList, currentActiveMapId]);

  // نمایش پیام اعلان
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // تغییر وضعیت مرئی بودن لایه
  const handleToggleLayerVisibility = (layerId: string) => {
    if (!currentMap) return;
    SurveyMapService.toggleLayerVisibility(currentMap.id, layerId);
    refreshMaps();
  };

  // تغییر وضعیت انتخابی برچسب‌های یک لایه
  const handleToggleLayerLabels = (layerId: string) => {
    if (!currentMap) return;
    SurveyMapService.toggleLayerLabels(currentMap.id, layerId);
    refreshMaps();
  };

  // تغییر دسته‌جمعی وضعیت برچسب‌های لایه‌های انتخابی
  const handleSetLayersLabelsVisibility = (layerIds: string[], show: boolean) => {
    if (!currentMap) return;
    SurveyMapService.setLayersLabelsVisibility(currentMap.id, layerIds, show);
    refreshMaps();
    showToast(show ? 'برچسب لایه‌های انتخابی فعال شد.' : 'برچسب لایه‌های انتخابی پنهان شد.', 'info');
  };

  // اعمال استایل و رنگ گروهی یا تکی روی لایه‌ها
  const handleUpdateLayersStyle = (
    layerIds: string[],
    style: {
      color?: string;
      strokeWidth?: number;
      strokeDash?: 'solid' | 'dashed' | 'dotted' | 'dashdot';
      opacity?: number;
      showLabels?: boolean;
    },
    applyToFeatures: boolean = true
  ) => {
    if (!currentMap) return;
    SurveyMapService.updateLayersStyle(
      currentMap.id,
      layerIds,
      style,
      applyToFeatures,
      activeRole,
      activeUserName
    );
    refreshMaps();
    showToast(`استایل ${layerIds.length} لایه با موفقیت اعمال و ذخیره گردید.`, 'success');
  };

  // تغییر دسته‌جمعی مرئی بودن لایه‌ها
  const handleBatchToggleLayers = (layerIds: string[], visible: boolean) => {
    if (!currentMap) return;
    SurveyMapService.setLayersVisibility(currentMap.id, layerIds, visible);
    refreshMaps();
    showToast(visible ? 'تمامی لایه‌های انتخابی فعال شدند.' : 'لایه‌های انتخابی پنهان شدند.', 'info');
  };

  // تغییر شفافیت لایه
  const handleChangeLayerOpacity = (layerId: string, opacity: number) => {
    if (!currentMap) return;
    SurveyMapService.setLayerOpacity(currentMap.id, layerId, opacity);
    refreshMaps();
  };

  // قفل یا باز کردن قفل ویرایش لایه
  const handleToggleLayerLock = (layerId: string) => {
    if (!currentMap) return;
    SurveyMapService.toggleLayerLock(currentMap.id, layerId);
    refreshMaps();
  };

  // تغییر تنظیمات نمایش اورلی
  const handleChangeDisplaySettings = (settings: Partial<DisplayOverlaySettings>) => {
    setDisplaySettings(prev => ({ ...prev, ...settings }));
  };

  // تصویب رسمی نسخه نقشه
  const handleApproveRevision = () => {
    if (!currentMap) return;
    if (!permissions.canApproveOfficialMap) {
      showToast('تنها کارفرما و سرپرست نظارت مجاز به تصویب رسمی نقشه می‌باشند.', 'warning');
      return;
    }

    const nextVer = `Rev ${(parseFloat(currentMap.version.replace('Rev ', '') || '1.0') + 0.1).toFixed(1)}`;
    const approvalNote = window.prompt(`توضیحات تصویب و ابلاغ نسخه رسمی (${nextVer}):`, 'تأیید نهایی مرزهای ساب‌بلوک‌ها و انطباق با مدل زمین‌شناسی جهت بارگیری');
    
    if (approvalNote !== null) {
      SurveyMapService.approveAndPublishMap(
        currentMap.id,
        nextVer,
        activeUserName,
        activeRole,
        approvalNote || 'تأیید رسمی نقشه'
      );
      refreshMaps();
      showToast(`نسخه جدید (${nextVer}) با موفقیت تصویب و برای سایر ارکان ابلاغ گردید.`, 'success');
    }
  };

  const isFull = isFullScreenMode || internalFullScreen;

  const toggleFull = () => {
    if (onToggleFullScreen) {
      onToggleFullScreen();
    } else {
      setInternalFullScreen(!internalFullScreen);
    }
  };

  if (!currentMap) {
    return (
      <div className="p-12 text-center text-slate-400 bg-[#070F1E] rounded-2xl border border-slate-800">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3" />
        <div className="text-xs">در حال بارگذاری استودیو نقشه‌های معدن...</div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full overflow-hidden transition-all duration-300 flex flex-col ${
        isFull 
          ? 'fixed inset-0 z-50 bg-[#070F1E] h-screen w-screen p-2' 
          : 'h-[calc(100vh-140px)] min-h-[640px] rounded-2xl border border-slate-800/90 bg-[#070F1E]'
      }`} 
      dir="rtl"
    >
      {/* اعلان‌های توست شناور باریک */}
      {notification && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-md ${
          notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' :
          notification.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-300' :
          'bg-cyan-950/90 border-cyan-500/50 text-cyan-300'
        }`}>
          <SparklesIcon className="w-4 h-4" />
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white mr-1 text-xs">✕</button>
        </div>
      )}

      {/* چیدمان اصلی تمام‌صفحه: کادر اتوکد Properties در سمت چپ + بوم نقشه در مرکز */}
      <div className="flex-1 w-full h-full flex flex-row overflow-hidden relative">
        
        {/* ۱. کادر Properties در سمت چپ بوم (AutoCAD Properties Palette) */}
        {isPropertiesOpen && (
          <AutoCadPropertiesPanel
            layers={currentMap.layers || []}
            selectedFeature={selectedFeature}
            displaySettings={displaySettings}
            benchLevel={currentMap.benchLevel}
            totalFeaturesCount={currentMap.features?.length || 0}
            activeRole={activeRole}
            canEdit={permissions.canEditFeatures}
            onSelectFeature={setSelectedFeature}
            onEditFeatureRequest={(feat) => {
              setSelectedFeature(feat);
              setIsEditModalOpen(true);
            }}
            onDeleteFeatureRequest={(feat) => {
              setFeatureToDelete(feat);
            }}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onToggleLayerLock={handleToggleLayerLock}
            onToggleLayerLabels={handleToggleLayerLabels}
            onChangeLayerOpacity={handleChangeLayerOpacity}
            onBatchToggleLayers={handleBatchToggleLayers}
            onSetLayersLabelsVisibility={handleSetLayersLabelsVisibility}
            onUpdateLayersStyle={handleUpdateLayersStyle}
            onChangeDisplaySettings={handleChangeDisplaySettings}
            onClose={() => setIsPropertiesOpen(false)}
          />
        )}

        {/* ۲. بوم نقشه و ابزارها (Canvas Workspace) */}
        <div className="flex-1 h-full relative overflow-hidden flex flex-col justify-between">
          <MapCanvasEditor
            map={currentMap}
            activeRole={activeRole}
            userName={activeUserName}
            activeTool={activeTool}
            selectedFeatureId={selectedFeature?.id || null}
            displaySettings={displaySettings}
            onSelectFeature={(feat) => {
              setSelectedFeature(feat);
              if (feat) setIsPropertiesOpen(true);
            }}
            onFeatureCreated={() => {
              refreshMaps();
              showToast('عارضه با موفقیت روی نقشه ترسیم و ثبت شد.', 'success');
            }}
            onEditFeatureRequest={(feat) => {
              setSelectedFeature(feat);
              setIsEditModalOpen(true);
            }}
            onDeleteFeatureRequest={permissions.canEditFeatures ? (feat) => setFeatureToDelete(feat) : undefined}
            onMapUpdated={refreshMaps}
            onOpenLayersPanel={() => setIsPropertiesOpen(true)}
          />

          {/* ۳. ستون ابزارهای ترسیم راست (CAD Drawing Toolbar) */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90 shadow-2xl">
            {/* انتخاب و بازرسی */}
            <button
              onClick={() => setActiveTool('SELECT')}
              title="انتخاب و بازرسی المان‌ها (Select)"
              className={`p-2.5 rounded-xl transition-all relative group flex items-center justify-center ${
                activeTool === 'SELECT'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CursorArrowRaysIcon className="w-5 h-5" />
              <span className="absolute right-12 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                انتخاب و بازرسی
              </span>
            </button>

            {/* ساب‌بلوک چندضلعی */}
            <button
              onClick={() => {
                if (!permissions.canCreateSubBlocksOnMap) {
                  showToast('نقش شما دسترسی تفکیک ساب‌بلوک را ندارد.', 'warning');
                  return;
                }
                setActiveTool('POLYGON');
              }}
              title="ترسیم محدوده ساب‌بلوک"
              className={`p-2.5 rounded-xl transition-all relative group flex items-center justify-center ${
                activeTool === 'POLYGON'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Square2StackIcon className="w-5 h-5" />
              <span className="absolute right-12 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                ترسیم ساب‌بلوک
              </span>
            </button>

            {/* رمپ و خط تراز پله */}
            <button
              onClick={() => {
                if (!permissions.canEditFeatures) {
                  showToast('شما دسترسی ویرایش خطوط مهندسی را ندارید.', 'warning');
                  return;
                }
                setActiveTool('POLYLINE');
              }}
              title="ترسیم رمپ / لبه پله"
              className={`p-2.5 rounded-xl transition-all relative group flex items-center justify-center ${
                activeTool === 'POLYLINE'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PencilIcon className="w-5 h-5" />
              <span className="absolute right-12 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                ترسیم رمپ / لبه پله
              </span>
            </button>

            {/* نقطه بنچ‌مارک ژئودزی */}
            <button
              onClick={() => {
                if (!permissions.canEditFeatures) {
                  showToast('شما دسترسی ثبت بنچ‌مارک ندارید.', 'warning');
                  return;
                }
                setActiveTool('POINT');
              }}
              title="ثبت بنچ‌مارک نقشه‌برداری"
              className={`p-2.5 rounded-xl transition-all relative group flex items-center justify-center ${
                activeTool === 'POINT'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <AdjustmentsVerticalIcon className="w-5 h-5" />
              <span className="absolute right-12 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                ثبت بنچ‌مارک
              </span>
            </button>

            {/* ابزار خط‌کش و اندازه‌گیری */}
            <button
              onClick={() => setActiveTool('MEASURE')}
              title="خط‌کش و اندازه‌گیری مساحت و طول"
              className={`p-2.5 rounded-xl transition-all relative group flex items-center justify-center ${
                activeTool === 'MEASURE'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ScaleIcon className="w-5 h-5" />
              <span className="absolute right-12 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                ابزار اندازه‌گیری
              </span>
            </button>

            {/* جابجایی دست Pan */}
            <button
              onClick={() => setActiveTool('PAN')}
              title="جابجایی نقشه (Pan)"
              className={`p-2.5 rounded-xl transition-all relative group flex items-center justify-center ${
                activeTool === 'PAN'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HandRaisedIcon className="w-5 h-5" />
              <span className="absolute right-12 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                جابجایی دید (Pan)
              </span>
            </button>
          </div>

          {/* ۴. نوار ابزار افقی در پایین کادر نقشه (Horizontal Action Toolbar) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90 shadow-2xl pointer-events-auto max-w-[calc(100%-24px)] overflow-x-auto">
            
            {/* دکمه کادر Properties و مدیریت لایه‌ها */}
            <button
              onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
              title="کادر مشخصات و لایه‌ها (AutoCAD Properties)"
              className={`p-2 rounded-xl transition-all relative group flex items-center justify-center ${
                isPropertiesOpen
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Square2StackIcon className="w-4 h-4" />
              <span className="absolute bottom-11 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                مشخصات و لایه‌ها
              </span>
            </button>

            {/* مشخصات المان */}
            <button
              onClick={() => {
                setIsPropertiesOpen(true);
              }}
              title="مشخصات فنی و پارامترهای المان"
              className={`p-2 rounded-xl transition-all relative group flex items-center justify-center ${
                selectedFeature
                  ? 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/70 ring-1 ring-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <InformationCircleIcon className="w-4 h-4" />
              <span className="absolute bottom-11 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                مشخصات المان
              </span>
            </button>

            {/* تاریخچه ممیزی نقشه */}
            <button
              onClick={() => setIsAuditModalOpen(true)}
              title="تاریخچه ممیزی و بازنگری‌ها"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all relative group flex items-center justify-center"
            >
              <ClockIcon className="w-4 h-4" />
              <span className="absolute bottom-11 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                تاریخچه ممیزی
              </span>
            </button>

            <div className="w-px h-4 bg-slate-800 mx-0.5" />

            {/* ورود نقشه DXF / GeoJSON */}
            {permissions.canUploadMap && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                title="بارگذاری نقشه (DXF / GeoJSON)"
                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-all relative group flex items-center justify-center"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span className="absolute bottom-11 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                  بارگذاری نقشه
                </span>
              </button>
            )}

            {/* تصویب و ابلاغ رسمی نقشه */}
            {permissions.canApproveOfficialMap && (
              <button
                onClick={handleApproveRevision}
                title="تصویب و ابلاغ رسمی نقشه"
                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-all relative group flex items-center justify-center"
              >
                <CheckBadgeIcon className="w-4 h-4" />
                <span className="absolute bottom-11 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                  تصویب رسمی نقشه
                </span>
              </button>
            )}

            {/* ماتریس سطوح دسترسی (RBAC) */}
            <button
              onClick={() => setIsPermissionsModalOpen(true)}
              title="ماتریس سطوح دسترسی (RBAC)"
              className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 transition-all relative group flex items-center justify-center"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span className="absolute bottom-11 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                سطوح دسترسی
              </span>
            </button>

            {/* صدور خروجی */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              title="صدور خروجی از نقشه (DXF / GeoJSON / PDF)"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all relative group flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="absolute bottom-11 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                صدور خروجی
              </span>
            </button>

            <div className="w-px h-4 bg-slate-800 mx-0.5" />

            {/* انتخاب نقش دسترسی */}
            <select
              value={activeRole}
              onChange={(e) => {
                const role = e.target.value as StakeholderRole;
                setActiveRole(role);
                setActiveUserName(
                  role === 'SUPERVISION' ? 'مهندس مرادی (نقشه‌برداری نظارت)' :
                  role === 'MINING_CONTRACTOR' ? 'مهندس رضایی (دفتر فنی استخراج)' :
                  role === 'CLIENT' ? 'مهندس حسینی (مدیریت کارفرما)' : 'سرپرست خردایش و دیسپاچینگ'
                );
                showToast(`نقش به '${SurveyPermissionService.getPermissions(role).title}' تغییر یافت.`);
              }}
              className="bg-slate-900 border border-slate-700/80 text-cyan-300 font-bold rounded-lg px-2 py-1 text-[11px] focus:outline-none cursor-pointer"
              title="تغییر نقش دسترسی"
            >
              <option value="SUPERVISION">نقشه‌برداری و نظارت</option>
              <option value="MINING_CONTRACTOR">پیمانکار استخراج</option>
              <option value="CLIENT">کارفرما</option>
              <option value="CRUSHING_CONTRACTOR">خردایش و دیسپاچینگ</option>
            </select>

            {/* دکمه تمام‌صفحه */}
            <button
              onClick={toggleFull}
              title={isFull ? 'خروج از تمام‌صفحه' : 'نمایش تمام‌صفحه نقشه'}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
            >
              {isFull ? <ArrowsPointingInIcon className="w-4 h-4 text-cyan-400" /> : <ArrowsPointingOutIcon className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* مودال تاریخچه ممیزی نقشه */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B132B] border border-slate-700/80 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">تاریخچه ممیزی و بازنگری‌های نقشه</h3>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
              {(currentMap.revisionHistory || []).map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-cyan-400 font-mono text-xs">{rev.revision}</span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {new Date(rev.timestamp).toLocaleDateString('fa-IR')} - {new Date(rev.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{rev.description}</p>
                  <div className="text-slate-500 text-[10px] flex justify-between pt-1 border-t border-slate-800/60">
                    <span>ثبت توسط: <b className="text-slate-300">{rev.performedBy}</b></span>
                    <span className="text-amber-400 font-bold">({rev.performedRole})</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تأیید حذف المان */}
      {featureToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-md rounded-2xl bg-[#0B132B] border border-rose-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <TrashIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">تأیید حذف المان از نقشه</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {featureToDelete.category === 'SUB_BLOCK' ? 'ساب‌بلوک' :
                   featureToDelete.category === 'SURVEY_BENCHMARK' ? 'نقطه بنچ‌مارک' :
                   featureToDelete.category === 'HAUL_ROAD' ? 'خط مسیر / رمپ' :
                   featureToDelete.category === 'BENCH_CREST' ? 'خط لبه پله (Crest)' :
                   featureToDelete.category === 'BENCH_TOE' ? 'خط پای پله (Toe)' :
                   featureToDelete.category === 'ANNOTATION' ? 'یادداشت متنی' : 'ترسیم'}: <span className="text-cyan-300 font-bold">{featureToDelete.name}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              آیا از حذف المان مطمئن هستید؟ با انتخاب گزینه بله، ترسیم و مشخصات فنی آن از روی نقشه حذف خواهد شد.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                onClick={() => setFeatureToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  SurveyMapService.deleteFeature(currentMap.id, featureToDelete.id, activeRole, activeUserName);
                  if (selectedFeature?.id === featureToDelete.id) {
                    setSelectedFeature(null);
                  }
                  setFeatureToDelete(null);
                  refreshMaps();
                  showToast(`المان '${featureToDelete.name}' با موفقیت حذف گردید.`, 'info');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                <TrashIcon className="w-4 h-4" />
                <span>بله، حذف شود</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال‌های سیستم */}
      {isImportModalOpen && (
        <MapImportModal
          activeRole={activeRole}
          userName={activeUserName}
          onClose={() => setIsImportModalOpen(false)}
          onMapImported={(newMap) => {
            setIsImportModalOpen(false);
            refreshMaps();
            setInternalActiveMapId(newMap.id);
            if (onMapChange) onMapChange(newMap.id);
            showToast(`نقشه '${newMap.title}' با موفقیت وارد سامانه گردید.`);
          }}
        />
      )}

      {isEditModalOpen && selectedFeature && (
        <FeatureEditModal
          feature={selectedFeature}
          mapId={currentMap.id}
          activeRole={activeRole}
          userName={activeUserName}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updates) => {
            const updated = SurveyMapService.updateFeature(
              currentMap.id,
              selectedFeature.id,
              updates,
              activeRole,
              activeUserName
            );
            setIsEditModalOpen(false);
            if (updated) setSelectedFeature(updated);
            refreshMaps();
            showToast('مشخصات المان با موفقیت به‌روزرسانی شد.');
          }}
        />
      )}

      {isPermissionsModalOpen && (
        <PermissionsMatrixModal
          activeRole={activeRole}
          onSelectRole={(r) => {
            setActiveRole(r);
            setActiveUserName(
              r === 'SUPERVISION' ? 'مهندس مرادی (نقشه‌برداری نظارت)' :
              r === 'MINING_CONTRACTOR' ? 'مهندس رضایی (دفتر فنی استخراج)' :
              r === 'CLIENT' ? 'مهندس حسینی (مدیریت کارفرما)' : 'سرپرست خردایش و دیسپاچینگ'
            );
            showToast(`نقش تغییر یافت به: ${SurveyPermissionService.getPermissions(r).title}`);
          }}
          onClose={() => setIsPermissionsModalOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <MapExportModal
          map={currentMap}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}

export default SurveyMapStudio;
