// src/modules/mine/presentation/pages/MineMapPage/index.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { Header } from '../../../../dashboard/presentation/components/Header/Header';
import { MineRepository } from '../../../../../core/infrastructure/repositories';
import { SurveyMapService } from '../../../services/SurveyMapService';
import type { SurveyMap } from '../../../../../core/domain/types/survey-map.types';
import { SurveyMapStudio } from '../../components/SurveyMapStudio/SurveyMapStudio';
import { SurveyImportMetadataLinker } from '../../components/SurveyMapStudio/SurveyImportMetadataLinker';
import { 
  ArrowRightIcon, 
  SparklesIcon,
  MapIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

export const MineMapPage: React.FC = () => {
  const { isDark } = useTheme();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isRtl = language === 'fa';

  // تب فعال: استودیو نقشه‌برداری مهندسی vs ورود و اتصال متادیتا
  const [activeTab, setActiveTab] = useState<'SURVEY_STUDIO' | 'IMPORT_LINKER'>('SURVEY_STUDIO');
  
  // لیست نقشه‌ها و نقشه فعال بر اساس آخرین نقشه مرجع تأییدشده واحد نقشه‌برداری
  const [mapsList, setMapsList] = useState<SurveyMap[]>(() => SurveyMapService.getAllMaps());
  const [activeMapId, setActiveMapId] = useState<string>(() => SurveyMapService.getActiveMasterMapId());
  const [masterMapId, setMasterMapId] = useState<string>(() => SurveyMapService.getActiveMasterMapId());

  const refreshMapsList = () => {
    const all = SurveyMapService.getAllMaps();
    setMapsList(all);
    const currentMaster = SurveyMapService.getActiveMasterMapId();
    setMasterMapId(currentMaster);
    if (!activeMapId && all.length > 0) {
      setActiveMapId(currentMaster || all[0].id);
    }
  };

  // اشتراک در تغییرات بلادرنگ نقشه مرجع واحد نقشه‌برداری
  React.useEffect(() => {
    const unsubscribe = SurveyMapService.subscribeToMasterMapUpdates((updatedMasterMap) => {
      const all = SurveyMapService.getAllMaps();
      setMapsList(all);
      setMasterMapId(updatedMasterMap.id);
      setActiveMapId(updatedMasterMap.id);
    });

    return () => unsubscribe();
  }, []);

  const currentSelectedMap = useMemo(() => {
    return mapsList.find(m => m.id === activeMapId) || mapsList[0] || null;
  }, [mapsList, activeMapId]);

  const isCurrentMapMaster = currentSelectedMap?.id === masterMapId || !!currentSelectedMap?.isMasterMap;

  // تعیین نقشه انتخابی به عنوان نقشه مرجع رسمی سامانه توسط واحد نقشه‌برداری
  const handleSetAsMasterMap = () => {
    if (!currentSelectedMap) return;
    SurveyMapService.setActiveMasterMap(
      currentSelectedMap.id, 
      'SUPERVISION', 
      'مهندس مرادی (واحد نقشه‌برداری)'
    );
    refreshMapsList();
  };

  const mines = MineRepository.getAll();
  const mine = mines[0] || { name: isRtl ? 'مجتمع معدنی سنگ‌آهن چادرملو' : 'Chadormalu Iron Ore Complex', code: 'MINE-01' };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#070F1E] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header />

      <main className="flex-1 flex flex-col w-full px-2 sm:px-4 py-2">
        {/* نوار بالایی و عنوان صفحه هماهنگ با اتوکد و GIS مهندسی معدن */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
          
          {/* سمت راست: دکمه بازگشت + عنوان «مدیریت نقشه» + نام معدن + منوی انتخاب نقشه بارگذاری‌شده */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-[#111726] border-[#1E293B] text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600'
              }`}
              title={t('common.back')}
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{t('map.title')}</span>
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 hidden sm:inline">
                {mine.name}
              </span>
            </div>

            {/* منوی زبانه‌ای مربوط به انتخاب نقشه‌های بارگذاری شده در هدر */}
            {mapsList.length > 0 && (
              <div className={`flex items-center gap-2 p-1.5 rounded-xl border shadow-sm ${
                isDark ? 'bg-[#0B1323] border-[#1E293B]' : 'bg-white border-slate-200'
              }`}>
                <MapIcon className="w-4 h-4 text-cyan-400 mr-1" />
                <select
                  value={activeMapId}
                  onChange={(e) => setActiveMapId(e.target.value)}
                  className={`text-xs font-bold rounded-lg px-2.5 py-1 focus:border-cyan-400 focus:outline-none cursor-pointer ${
                    isDark ? 'bg-[#070F1E] border border-slate-700/80 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                  title={isRtl ? 'انتخاب نقشه فعال' : 'Select Active Map'}
                >
                  {mapsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isMasterMap ? '⭐ [نقشه مرجع] ' : ''}{m.title} ({m.version})
                    </option>
                  ))}
                </select>

                {currentSelectedMap && (
                  <>
                    {isCurrentMapMaster ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1 bg-cyan-950/80 border-cyan-400/60 text-cyan-300 shadow-sm" title={isRtl ? 'این نقشه مرجع رسمی و مبنای فعالیت تمام واحدهای معدن است' : 'Master Reference Map for all units'}>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span>{isRtl ? 'نقشه مرجع سامانه (واحد نقشه‌برداری)' : 'Master Map (Surveying)'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleSetAsMasterMap}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 transition-colors"
                        title={isRtl ? 'انتشار این نقشه به عنوان نقشه مبنا و مرجع کل سامانه' : 'Set as Master Reference Map for all units'}
                      >
                        {isRtl ? '⭐ انتشار به عنوان نقشه مرجع سامانه' : 'Publish as Master Map'}
                      </button>
                    )}

                    <span className={`text-[10px] font-mono hidden md:inline px-1.5 py-0.5 rounded ${
                      isDark ? 'text-slate-300 bg-slate-800' : 'text-slate-700 bg-slate-200'
                    }`}>
                      {isRtl ? `تراز ${currentSelectedMap.benchLevel}m` : `Level ${currentSelectedMap.benchLevel}m`}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* سمت چپ: آیکون‌های سربرگ استودیو و بارگذاری نقشه + میانبر چرخه استخراج */}
          <div className="flex flex-wrap items-center gap-2">
            {/* سوییچر سربرگ‌ها: فقط آیکون نقشه و آیکون ورود نقشه با تولتیپ هاور */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs ${
              isDark ? 'bg-[#0B1323] border-[#1E293B]' : 'bg-slate-100 border-slate-200'
            }`}>
              {/* سربرگ ۱: استودیو نقشه (فقط آیکون با تولتیپ) */}
              <button
                onClick={() => setActiveTab('SURVEY_STUDIO')}
                title={isRtl ? 'استودیو نقشه' : 'Map Studio'}
                className={`p-2 rounded-lg transition-all relative group flex items-center justify-center ${
                  activeTab === 'SURVEY_STUDIO'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="absolute top-10 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
                  {isRtl ? 'استودیو نقشه' : 'Map Studio'}
                </span>
              </button>

              {/* سربرگ ۲: ورود نقشه و متادیتا (فقط آیکون با نمایان شدن متن بارگذاری نقشه در زمان قرار گرفتن نشانه‌گر موس) */}
              <button
                onClick={() => setActiveTab('IMPORT_LINKER')}
                title={isRtl ? 'بارگذاری نقشه' : 'Load Map'}
                className={`p-2 rounded-lg transition-all relative group flex items-center justify-center ${
                  activeTab === 'IMPORT_LINKER'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DocumentArrowUpIcon className="w-4 h-4" />
                <span className="absolute top-10 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50">
                  {isRtl ? 'بارگذاری نقشه' : 'Load Map'}
                </span>
              </button>
            </div>

            <button
              onClick={() => navigate('/mining-lifecycle')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 border border-[#00D4FF]/40 flex items-center gap-1.5 transition-all"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{isRtl ? 'چرخه ۱۳ مرحله‌ای استخراج' : '13-Step Lifecycle'}</span>
            </button>
          </div>
        </div>

        {/* محتوای تب فعال */}
        {activeTab === 'SURVEY_STUDIO' ? (
          <div className="flex-1 w-full h-[calc(100vh-130px)] min-h-[600px] relative">
            <SurveyMapStudio 
              activeMapId={activeMapId} 
              onMapChange={(newId) => {
                setActiveMapId(newId);
                refreshMapsList();
              }} 
            />
          </div>
        ) : (
          <div className={`border rounded-2xl p-5 shadow-2xl ${isDark ? 'bg-[#0B1323] border-[#1E293B]' : 'bg-white border-slate-200'}`}>
            <SurveyImportMetadataLinker
              activeRole="SUPERVISION"
              userName="مهندس مرادی (واحد نقشه‌برداری)"
              isStandalonePage={false}
              onMapImported={(newMap) => {
                // تعیین خودکار به عنوان آخرین نقشه مرجع فعال کل سامانه توسط واحد نقشه‌برداری
                SurveyMapService.setActiveMasterMap(newMap.id, 'SUPERVISION', 'مهندس مرادی (واحد نقشه‌برداری)');
                refreshMapsList();
                setActiveMapId(newMap.id);
                setActiveTab('SURVEY_STUDIO');
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default MineMapPage;
