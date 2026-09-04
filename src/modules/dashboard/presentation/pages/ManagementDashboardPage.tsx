// src/modules/dashboard/presentation/pages/ManagementDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';

// Executive Widgets
import { ExecutiveStockpileWidget } from '../components/executive/ExecutiveStockpileWidget';
import { ExecutiveExtractionByRockTypeWidget } from '../components/executive/ExecutiveExtractionByRockTypeWidget';
import { ExecutiveStrippingRatioWidget } from '../components/executive/ExecutiveStrippingRatioWidget';
import { ExecutiveCrusherFeedGradeWidget } from '../components/executive/ExecutiveCrusherFeedGradeWidget';
import { ExecutiveFleetOEEWidget } from '../components/executive/ExecutiveFleetOEEWidget';
import { ExecutiveCostRevenueWidget } from '../components/executive/ExecutiveCostRevenueWidget';
import { ExecutiveSlopeSafetyRadarWidget } from '../components/executive/ExecutiveSlopeSafetyRadarWidget';
import { ExecutiveDrillBlastBrokenOreWidget } from '../components/executive/ExecutiveDrillBlastBrokenOreWidget';
import { ExecutiveMiningPlanComplianceWidget } from '../components/executive/ExecutiveMiningPlanComplianceWidget';
import { ExecutiveTailingsEnvironmentalWidget } from '../components/executive/ExecutiveTailingsEnvironmentalWidget';
import { ExecutiveShiftWorkforceWidget } from '../components/executive/ExecutiveShiftWorkforceWidget';
import { ExecutiveStrategicAlertsWidget } from '../components/executive/ExecutiveStrategicAlertsWidget';

// Toolbar & Customizer Modal
import { ExecutiveWidgetsToolbar } from '../components/executive/ExecutiveWidgetsToolbar';
import { ExecutiveWidgetCustomizerModal } from '../components/executive/ExecutiveWidgetCustomizerModal';
import { EXECUTIVE_WIDGETS_CONFIG, PRESET_PROFILES } from '../components/executive/executiveWidgets.types';

// Icons & Base KPIs
import { DashboardKPIs } from '../components/DashboardKPIs';
import { 
  SparklesIcon, 
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'aes_executive_visible_widgets_v1';

export const ManagementDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('today');

  // Initialize visible widgets map from default configuration or localStorage
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    EXECUTIVE_WIDGETS_CONFIG.forEach(w => {
      initialMap[w.id] = w.defaultVisible;
    });

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialMap, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read saved widget settings', e);
    }
    return initialMap;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleWidgets));
    } catch (e) {
      console.warn('Could not save widget settings', e);
    }
  }, [visibleWidgets]);

  const handleToggleWidget = (id: string) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleApplyPreset = (widgetIds: string[]) => {
    const newMap: Record<string, boolean> = {};
    EXECUTIVE_WIDGETS_CONFIG.forEach(w => {
      newMap[w.id] = widgetIds.includes(w.id);
    });
    setVisibleWidgets(newMap);
  };

  const handleSelectAll = () => {
    const newMap: Record<string, boolean> = {};
    EXECUTIVE_WIDGETS_CONFIG.forEach(w => {
      newMap[w.id] = true;
    });
    setVisibleWidgets(newMap);
  };

  const handleHideAll = () => {
    const newMap: Record<string, boolean> = {};
    EXECUTIVE_WIDGETS_CONFIG.forEach(w => {
      newMap[w.id] = false;
    });
    setVisibleWidgets(newMap);
  };

  const handleResetDefaults = () => {
    const defaultMap: Record<string, boolean> = {};
    EXECUTIVE_WIDGETS_CONFIG.forEach(w => {
      defaultMap[w.id] = w.defaultVisible;
    });
    setVisibleWidgets(defaultMap);
  };

  const activeWidgetCount = Object.values(visibleWidgets).filter(Boolean).length;

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#090D16] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Inner Container */}
        <main className="p-6 md:p-8 space-y-6 max-w-[1700px] mx-auto w-full">
          {/* Top Title Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>{isRtl ? 'داشبورد جامع مدیریت کلان و کارفرما' : 'Executive Management Dashboard'}</span>
                </h1>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {isRtl ? 'سامانه تصمیم‌گیری هوشمند معدن' : 'Smart Decision Support'}
                </span>
              </div>
            </div>

            {/* Quick Link back to Standard Overview */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                  isDark 
                    ? 'bg-[#111726] border-[#1F293D] text-slate-300 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 shadow-sm'
                }`}
              >
                {isRtl ? 'نمای عمومی داشبورد' : 'Standard Overview'}
              </button>

              <button
                onClick={() => setCustomizerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] shadow-lg shadow-[#6366F1]/25 transition-all"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <span>{isRtl ? 'مدیریت و فیلتر ویجت‌ها' : 'Manage Widgets'}</span>
              </button>
            </div>
          </div>

          {/* Row 1: High-Level Universal KPIs (5 in a row) */}
          <DashboardKPIs />

          {/* Row 2: Management Widget Toolbar with Presets, Date Picker & Show/Hide */}
          <ExecutiveWidgetsToolbar
            visibleWidgets={visibleWidgets}
            onOpenCustomizer={() => setCustomizerOpen(true)}
            onApplyPreset={handleApplyPreset}
            activeTimeRange={timeRange}
            onChangeTimeRange={setTimeRange}
          />

          {/* Active Empty State if user hid everything */}
          {activeWidgetCount === 0 && (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/30">
              <SparklesIcon className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-black text-white mb-1">
                {isRtl ? 'هیچ ویجتی در حال حاضر فعال نیست' : 'No widgets currently visible'}
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                {isRtl ? 'برای مشاهده شاخص‌ها و اطلاعات مدیریتی، ویجت‌های مورد نظر خود را فعال کنید.' : 'Open widget manager to enable your desired executive KPI widgets.'}
              </p>
              <button
                onClick={handleResetDefaults}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isRtl ? 'فعال‌سازی ویجت‌های پیش‌فرض' : 'Reset Default Widgets'}
              </button>
            </div>
          )}

          {/* Executive Widgets Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Widget 1: موجودی دپوهای ماده معدنی */}
            {visibleWidgets['stockpile_inventory'] && (
              <div className="w-full">
                <ExecutiveStockpileWidget />
              </div>
            )}

            {/* Widget 2: استخراج به تفکیک جنس سنگ و لیتولوژی */}
            {visibleWidgets['extraction_by_rock'] && (
              <div className="w-full">
                <ExecutiveExtractionByRockTypeWidget />
              </div>
            )}

            {/* Widget 3: نسبت باطله‌برداری دوره‌ای (Strip Ratio) */}
            {visibleWidgets['stripping_ratio_trend'] && (
              <div className="w-full">
                <ExecutiveStrippingRatioWidget />
              </div>
            )}

            {/* Widget 4: عیار خوراک سنگ‌شکن و بازیابی */}
            {visibleWidgets['crusher_feed_grade'] && (
              <div className="w-full">
                <ExecutiveCrusherFeedGradeWidget />
              </div>
            )}

            {/* Widget 5: راندمان و دسترس‌پذیری ناوگان */}
            {visibleWidgets['fleet_oee_utilization'] && (
              <div className="w-full">
                <ExecutiveFleetOEEWidget />
              </div>
            )}

            {/* Widget 6: بهای تمام‌شده هر تن استخراج و شاخص‌های مالی */}
            {visibleWidgets['unit_cost_revenue'] && (
              <div className="w-full">
                <ExecutiveCostRevenueWidget />
              </div>
            )}

            {/* Widget 7: پایداری دیواره پیت و ایمنی HSE */}
            {visibleWidgets['slope_stability_safety'] && (
              <div className="w-full">
                <ExecutiveSlopeSafetyRadarWidget />
              </div>
            )}

            {/* Widget 8: بیلان مواد ناریه و کانسنگ آماده بارگیری */}
            {visibleWidgets['drill_blast_broken_ore'] && (
              <div className="w-full">
                <ExecutiveDrillBlastBrokenOreWidget />
              </div>
            )}

            {/* Widget 9: انطباق با طرح استخراج مصوب */}
            {visibleWidgets['mining_plan_compliance'] && (
              <div className="w-full">
                <ExecutiveMiningPlanComplianceWidget />
              </div>
            )}

            {/* Widget 10: پایش باطله‌گاه‌ها و محیط‌زیست */}
            {visibleWidgets['tailings_environmental'] && (
              <div className="w-full">
                <ExecutiveTailingsEnvironmentalWidget />
              </div>
            )}

            {/* Widget 11: بهره‌وری نیروی انسانی و شیفت‌ها */}
            {visibleWidgets['shift_workforce_productivity'] && (
              <div className="w-full">
                <ExecutiveShiftWorkforceWidget />
              </div>
            )}

            {/* Widget 12: هشدارهای راهبردی و تصمیمات کارفرما (Full Width on 2-col) */}
            {visibleWidgets['strategic_manager_alerts'] && (
              <div className="w-full lg:col-span-2">
                <ExecutiveStrategicAlertsWidget />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Interactive Widget Customizer Modal */}
      <ExecutiveWidgetCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        visibleWidgets={visibleWidgets}
        onToggleWidget={handleToggleWidget}
        onApplyPreset={handleApplyPreset}
        onSelectAll={handleSelectAll}
        onHideAll={handleHideAll}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
};

export default ManagementDashboardPage;
