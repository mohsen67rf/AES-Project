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
import { MapLayersControlPanel, DisplayOverlaySettings } from './MapLayersControlPanel';
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
  PencilIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  BoltIcon,
  FireIcon
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

  // وضعیت باز بودن کشوی اختصاصی لایه‌های سازمانی
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState<boolean>(false);

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

    // اشتراک در رویدادهای زنده انتشار نقشه مرجع توسط واحد نقشه‌برداری
    const unsubscribe = SurveyMapService.subscribeToMasterMapUpdates((updatedMasterMap) => {
      const all = SurveyMapService.getAllMaps();
      setMapsList(all);
      if (updatedMasterMap?.id) {
        setInternalActiveMapId(updatedMasterMap.id);
        if (onMapChange) onMapChange(updatedMasterMap.id);
        showToast(`آخرین نقشه مرجع ابلاغ‌شده توسط واحد نقشه‌برداری دریافت و فعال شد (${updatedMasterMap.version}).`, 'info');
      }
    });

    return () => unsubscribe();
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

  // ایجاد سریع عوارض و باندهای تخصصی واحدها از داخل پنل لایه‌ها
  const handleQuickCreateUnitFeature = (featureType: 'DRILLING_BAND' | 'GEOLOGY_ROCK_BAND' | 'GEOLOGY_FAULT') => {
    setActiveTool(featureType);
    setIsLayersDrawerOpen(false);
    if (featureType === 'DRILLING_BAND') {
      showToast('حالت ترسیم باند حفاری فعال گردید. رئوس چندضلعی را کلیک کرده و با دابل‌کلیک ترسیم را نهایی کنید.', 'info');
    } else if (featureType === 'GEOLOGY_ROCK_BAND') {
      showToast('حالت ترسیم باند جنس سنگ فعال گردید. پس از رسم چندضلعی، نام لیتولوژی را ثبت نمایید.', 'info');
    } else if (featureType === 'GEOLOGY_FAULT') {
      showToast('حالت برداشت خط گسل فعال گردید. مسیر گسل را با کلیک روی بوم رسم نمایید.', 'info');
    }
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

  // انتشار رسمی نقشه به عنوان نقشه مرجع سراسری سامانه
  const handlePublishAsMasterMap = () => {
    if (!currentMap) return;
    SurveyMapService.setActiveMasterMap(
      currentMap.id,
      activeRole,
      activeUserName
    );
    refreshMaps();
    showToast(`نقشه '${currentMap.title}' به عنوان نقشه مرجع فعال سراسری ثبت و به کلیه واحدها ابلاغ گردید.`, 'success');
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
        <div className={`absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-md ${
          notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' :
          notification.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-300' :
          'bg-cyan-950/90 border-cyan-500/50 text-cyan-300'
        }`}>
          <SparklesIcon className="w-4 h-4" />
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white mr-1 text-xs">✕</button>
        </div>
      )}

      {/* نوار وضعیت رسمی نقشه مرجع واحد نقشه‌برداری (Master Map Reference Header) */}
      <div className="h-10 px-3 bg-slate-950/95 border-b border-slate-800/90 flex items-center justify-between gap-2 text-xs select-none shrink-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
            <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] whitespace-nowrap">واحد نقشه‌برداری (مرجع اصلی بارگذاری و به‌روزرسانی نقشه)</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono whitespace-nowrap">
            <span className="text-slate-400">نقشه جاری:</span>
            <span className="text-white font-bold max-w-[220px] truncate">{currentMap.title}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-bold">{currentMap.version}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-bold">تراز {currentMap.benchLevel}m</span>
          </div>

          {currentMap.isMasterMap ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>نقشه مرجع سراسری سامانه (مبنای مشترک کلیه واحدها)</span>
            </span>
          ) : (
            <button
              onClick={handlePublishAsMasterMap}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[10px] font-bold transition-all whitespace-nowrap"
              title="ثبت و ابلاغ این نقشه به عنوان نقشه مرجع به تمام بخش‌های سامانه"
            >
              <SparklesIcon className="w-3 h-3 text-amber-400" />
              <span>انتشار به عنوان نقشه مرجع سامانه</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsLayersDrawerOpen(!isLayersDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-colors shadow-sm"
            title="مدیریت لایه‌های اطلاعاتی ۸ واحد عملیاتی معدن (حفاری، زمین‌شناسی، استخراج، ترابری و...)"
          >
            <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">لایه‌های اطلاعاتی واحدها</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-amber-300">
              {currentMap.layers?.length || 0}
            </span>
          </button>
        </div>
      </div>

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
              setActiveTool('SELECT');
              showToast('عارضه با موفقیت روی نقشه ترسیم و ذخیره شد.', 'success');
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
            {/* انتخاب و بازرسی المان‌ها */}
            <button
              onClick={() => setActiveTool('SELECT')}
              title="انتخاب و بازرسی (Select)"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'SELECT'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CursorArrowRaysIcon className="w-5 h-5" />
            </button>

            <div className="w-full h-px bg-slate-800/80 my-0.5" />

            {/* ابزار واحد حفاری: ترسیم باند حفاری */}
            <button
              onClick={() => {
                if (!permissions.canEditFeatures) {
                  showToast('عدم دسترسی ثبت باند حفاری', 'warning');
                  return;
                }
                setActiveTool('DRILLING_BAND');
                showToast('ترسیم باند حفاری فعال شد. با دابل‌کلیک ترسیم پایان می‌یابد.', 'info');
              }}
              title="ترسیم باند حفاری"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'DRILLING_BAND'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40 ring-1 ring-amber-300'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/30'
              }`}
            >
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </button>

            {/* ابزار واحد زمین‌شناسی: ترسیم باند جنس سنگ و لیتولوژی */}
            <button
              onClick={() => {
                if (!permissions.canEditFeatures) {
                  showToast('عدم دسترسی ثبت باندهای زمین‌شناسی', 'warning');
                  return;
                }
                setActiveTool('GEOLOGY_ROCK_BAND');
                showToast('ترسیم باند جنس سنگ فعال شد.', 'info');
              }}
              title="ترسیم باند جنس سنگ"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'GEOLOGY_ROCK_BAND'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/40 ring-1 ring-purple-300'
                  : 'text-purple-400/90 hover:text-purple-300 hover:bg-purple-950/30'
              }`}
            >
              <GlobeAltIcon className="w-5 h-5" />
            </button>

            {/* ابزار واحد زمین‌شناسی: برداشت خط گسل */}
            <button
              onClick={() => {
                if (!permissions.canEditFeatures) {
                  showToast('عدم دسترسی برداشت خطوط گسل', 'warning');
                  return;
                }
                setActiveTool('GEOLOGY_FAULT');
                showToast('برداشت خط گسل فعال شد.', 'info');
              }}
              title="برداشت خط گسل"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'GEOLOGY_FAULT'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40 ring-1 ring-rose-300'
                  : 'text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/30'
              }`}
            >
              <BoltIcon className="w-5 h-5" />
            </button>

            <div className="w-full h-px bg-slate-800/80 my-0.5" />

            {/* ساب‌بلوک چندضلعی (واحد استخراج) */}
            <button
              onClick={() => {
                if (!permissions.canCreateSubBlocksOnMap) {
                  showToast('عدم دسترسی تفکیک ساب‌بلوک', 'warning');
                  return;
                }
                setActiveTool('POLYGON');
                showToast('ترسیم ساب‌بلوک استخراجی فعال شد.', 'info');
              }}
              title="ترسیم ساب‌بلوک (استخراج)"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'POLYGON'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Square2StackIcon className="w-5 h-5" />
            </button>

            {/* رمپ و خط تراز پله */}
            <button
              onClick={() => {
                if (!permissions.canEditFeatures) {
                  showToast('عدم دسترسی ویرایش خطوط مهندسی', 'warning');
                  return;
                }
                setActiveTool('POLYLINE');
                showToast('ترسیم خطوط مهندسی و رمپ فعال شد.', 'info');
              }}
              title="ترسیم رمپ / لبه پله"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'POLYLINE'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PencilIcon className="w-5 h-5" />
            </button>

            {/* نقطه بنچ‌مارک ژئودزی */}
            <button
              onClick={() => {
                if (!permissions.canEditFeatures) {
                  showToast('عدم دسترسی ثبت بنچ‌مارک', 'warning');
                  return;
                }
                setActiveTool('POINT');
                showToast('ثبت نقطه بنچ‌مارک فعال شد.', 'info');
              }}
              title="ثبت بنچ‌مارک نقشه‌برداری"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'POINT'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <AdjustmentsVerticalIcon className="w-5 h-5" />
            </button>

            <div className="w-full h-px bg-slate-800/80 my-0.5" />

            {/* ابزار خط‌کش و اندازه‌گیری */}
            <button
              onClick={() => setActiveTool('MEASURE')}
              title="اندازه‌گیری طول و مساحت"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'MEASURE'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ScaleIcon className="w-5 h-5" />
            </button>

            {/* جابجایی دست Pan */}
            <button
              onClick={() => setActiveTool('PAN')}
              title="جابجایی دید (Pan)"
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTool === 'PAN'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HandRaisedIcon className="w-5 h-5" />
            </button>
          </div>

          {/* ۴. نوار ابزار افقی در پایین کادر نقشه (Horizontal Action Toolbar) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90 shadow-2xl pointer-events-auto max-w-[calc(100%-24px)] overflow-x-auto">
            
            {/* دکمه اختصاصی لایه‌های سازمانی (حفاری، زمین‌شناسی، استخراج) */}
            <button
              onClick={() => setIsLayersDrawerOpen(!isLayersDrawerOpen)}
              title="لایه‌های سازمانی"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                isLayersDrawerOpen
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40 ring-1 ring-amber-300'
                  : 'bg-slate-900/90 text-amber-300 border border-amber-500/30 hover:bg-amber-950/30 hover:border-amber-500/50'
              }`}
            >
              <WrenchScrewdriverIcon className="w-4 h-4 text-amber-400" />
              <span>لایه‌ها</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 font-mono">
                {currentMap.layers?.length || 0}
              </span>
            </button>

            {/* دکمه کادر Properties و استایل لایه‌ها */}
            <button
              onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
              title="مشخصات و استایل لایه‌ها (Properties)"
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                isPropertiesOpen
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Square2StackIcon className="w-4 h-4" />
            </button>

            {/* مشخصات المان */}
            <button
              onClick={() => {
                setIsPropertiesOpen(true);
              }}
              title="مشخصات المان انتخاب‌شده"
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                selectedFeature
                  ? 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/70 ring-1 ring-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <InformationCircleIcon className="w-4 h-4" />
            </button>

            {/* تاریخچه ممیزی نقشه */}
            <button
              onClick={() => setIsAuditModalOpen(true)}
              title="تاریخچه ممیزی و بازنگری‌ها"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all flex items-center justify-center"
            >
              <ClockIcon className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-800 mx-0.5" />

            {/* ورود نقشه DXF / GeoJSON */}
            {permissions.canUploadMap && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                title="بارگذاری نقشه (DXF / GeoJSON)"
                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-all flex items-center justify-center"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
              </button>
            )}

            {/* تصویب و ابلاغ رسمی نقشه */}
            {permissions.canApproveOfficialMap && (
              <button
                onClick={handleApproveRevision}
                title="تصویب و ابلاغ رسمی نقشه"
                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-all flex items-center justify-center"
              >
                <CheckBadgeIcon className="w-4 h-4" />
              </button>
            )}

            {/* ماتریس سطوح دسترسی (RBAC) */}
            <button
              onClick={() => setIsPermissionsModalOpen(true)}
              title="ماتریس سطوح دسترسی (RBAC)"
              className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 transition-all flex items-center justify-center"
            >
              <ShieldCheckIcon className="w-4 h-4" />
            </button>

            {/* صدور خروجی */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              title="صدور خروجی (DXF / GeoJSON / PDF)"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
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

      {/* کشوی تخصصی لایه‌های سازمانی واحدهای معدنی */}
      {isLayersDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" 
          dir="rtl"
          onClick={() => setIsLayersDrawerOpen(false)}
        >
          <div 
            className="w-full sm:w-[480px] h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 bg-[#070F1E]/95 backdrop-blur-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <MapLayersControlPanel
              mapId={currentMap.id}
              layers={currentMap.layers || []}
              displaySettings={displaySettings}
              isMasterMap={currentMap.isMasterMap}
              masterApprovedBy={currentMap.masterApprovedBy}
              masterApprovedAt={currentMap.masterApprovedAt}
              mapTitle={currentMap.title}
              benchLevel={currentMap.benchLevel}
              onToggleLayerVisibility={handleToggleLayerVisibility}
              onToggleLayerLock={handleToggleLayerLock}
              onToggleLayerLabels={handleToggleLayerLabels}
              onChangeLayerOpacity={handleChangeLayerOpacity}
              onBatchToggleLayers={handleBatchToggleLayers}
              onSetLayersLabelsVisibility={handleSetLayersLabelsVisibility}
              onUpdateLayersStyle={handleUpdateLayersStyle}
              onChangeDisplaySettings={handleChangeDisplaySettings}
              onQuickCreateUnitFeature={handleQuickCreateUnitFeature}
              onClose={() => setIsLayersDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyMapStudio;
