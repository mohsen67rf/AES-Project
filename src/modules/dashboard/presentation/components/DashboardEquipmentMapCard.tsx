// src/modules/dashboard/presentation/components/DashboardEquipmentMapCard.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { EquipmentService, MINE_MAP_ZONES } from '../../../equipment/services/EquipmentService';
import { EquipmentItem, EquipmentCategory, EquipmentStatus } from '../../../equipment/domain/types/equipment.types';
import { EquipmentVectorIcon } from '../../../equipment/presentation/components/EquipmentVectorIcons';
import { 
  Truck, 
  MapPin, 
  ArrowUpRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Activity,
  Wrench,
  Fuel,
  User,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const DashboardEquipmentMapCard: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRtl = language === 'fa';

  // State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

  // Load equipment fleet & summary
  const fleetList = useMemo(() => {
    return EquipmentService.getEquipmentList();
  }, []);

  const summary = useMemo(() => {
    return EquipmentService.getFleetSummary();
  }, []);

  // Filter items
  const filteredEquipment = useMemo(() => {
    if (selectedCategory === 'ALL') return fleetList;
    if (selectedCategory === 'LOADING') {
      return fleetList.filter(e => e.category === 'EXCAVATOR' || e.category === 'LOADER');
    }
    if (selectedCategory === 'HAULING') {
      return fleetList.filter(e => e.category.startsWith('DUMP_TRUCK'));
    }
    if (selectedCategory === 'DRILLING') {
      return fleetList.filter(e => e.category === 'DRILL_RIG');
    }
    if (selectedCategory === 'SUPPORT') {
      return fleetList.filter(e => 
        e.category === 'BULLDOZER' || 
        e.category === 'MOTOR_GRADER' || 
        e.category === 'WATER_TRUCK' || 
        e.category === 'SERVICE_FUEL_TRUCK'
      );
    }
    return fleetList;
  }, [fleetList, selectedCategory]);

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'ACTIVE':
      case 'HAULING':
        return {
          label: isRtl ? 'در حال کار' : 'Active',
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500'
        };
      case 'STANDBY':
      case 'REFUELING':
        return {
          label: isRtl ? 'آماده‌به‌کار / سوخت‌گیری' : 'Standby',
          color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500'
        };
      case 'MAINTENANCE':
        return {
          label: isRtl ? 'تعمیرگاه و سرویس' : 'Maintenance',
          color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500'
        };
      default:
        return {
          label: isRtl ? 'خاموش' : 'Off',
          color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-500'
        };
    }
  };

  return (
    <div 
      className={`rounded-[22px] p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between ${
        isDark 
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9] shadow-[0_12px_32px_rgba(7,11,26,0.5)]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center justify-center font-bold shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-[#F1F5F9]">
                {isRtl ? 'نقشه زنده موقعیت ناوگان و ماشین‌آلات' : 'Equipment & Fleet Live Location Map'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30">
                {summary.activeCount} فعال از {summary.totalCount} دستگاه
              </span>
            </div>
            <p className="text-xs text-[#8E9EB8] mt-0.5">
              {isRtl ? 'پایش لحظه‌ای استقرار شاول‌ها، دامپ‌ترک‌ها و ادوات در جبهه‌کارها' : 'Real-time monitoring of shovels, trucks, and rigs across benches'}
            </p>
          </div>
        </div>

        {/* Action Controls & Link to Full Equipment Page */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Zoom buttons */}
          <div className="flex items-center bg-[#141F42] border border-[#24356B]/40 rounded-xl p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
              className="p-1.5 text-[#8E9EB8] hover:text-[#00D2FF] transition-colors"
              title="بزرگنمایی"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
              className="p-1.5 text-[#8E9EB8] hover:text-[#00D2FF] transition-colors"
              title="کوچکنمایی"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-[#8E9EB8] hover:text-[#00D2FF] transition-colors"
              title="بازنشانی بزرگنمایی"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button 
            onClick={() => navigate('/equipment')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#00D2FF] bg-[#141F42] hover:bg-[#1E2D5C] border border-[#24356B]/40 transition-all cursor-pointer"
          >
            <span>{isRtl ? 'پایش جامع ناوگان' : 'Full Fleet Management'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar text-xs">
        {[
          { id: 'ALL', label: isRtl ? 'همه ناوگان' : 'All Fleet', count: fleetList.length },
          { id: 'LOADING', label: isRtl ? 'بارگیرها و شاول' : 'Excavators & Shovels', count: fleetList.filter(e => e.category === 'EXCAVATOR' || e.category === 'LOADER').length },
          { id: 'HAULING', label: isRtl ? 'دامپ‌تراک‌ها' : 'Dump Trucks', count: fleetList.filter(e => e.category.startsWith('DUMP_TRUCK')).length },
          { id: 'DRILLING', label: isRtl ? 'دستگاه‌های حفاری' : 'Drill Rigs', count: fleetList.filter(e => e.category === 'DRILL_RIG').length },
          { id: 'SUPPORT', label: isRtl ? 'پشتیبانی و سوخت' : 'Support & Service', count: fleetList.filter(e => e.category === 'BULLDOZER' || e.category === 'MOTOR_GRADER' || e.category === 'WATER_TRUCK' || e.category === 'SERVICE_FUEL_TRUCK').length },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#00D2FF]/15 border-[#00D2FF] text-[#00D2FF]'
                : isDark
                ? 'bg-[#141F42] border-[#24356B]/40 text-[#8E9EB8] hover:text-[#F1F5F9]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>{cat.label}</span>
            <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Interactive Map Canvas Container */}
      <div 
        className="relative w-full h-[360px] sm:h-[400px] rounded-[18px] overflow-hidden border border-[#24356B]/35 select-none transition-transform"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, #152248 0%, #0E1632 70%, #080D20 100%)'
            : 'radial-gradient(ellipse at 50% 50%, #F1F5F9 0%, #E2E8F0 70%, #CBD5E1 100%)'
        }}
      >
        {/* SVG Map Canvas with Contours, Zones & Haul Roads */}
        <div 
          className="absolute inset-0 transition-transform duration-200 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Topographic Contour Lines SVG Pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="fleetTopoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={isDark ? '#24356B' : '#CBD5E1'} strokeWidth="0.5" strokeOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fleetTopoGrid)" />

            {/* Pit Contours & Mining Benches */}
            <ellipse cx="50%" cy="50%" rx="38%" ry="26%" fill="none" stroke="#00D2FF" strokeWidth="1.2" strokeDasharray="6 4" strokeOpacity="0.4" />
            <ellipse cx="50%" cy="50%" rx="30%" ry="20%" fill="none" stroke="#00D2FF" strokeWidth="1.2" strokeOpacity="0.5" />
            <ellipse cx="50%" cy="50%" rx="22%" ry="14%" fill="none" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.6" />
            <ellipse cx="50%" cy="50%" rx="14%" ry="9%" fill="#00D2FF" fillOpacity="0.04" stroke="#38BDF8" strokeWidth="1.5" />

            {/* Haulage Roads (جاده‌های اصلی حمل مواد) */}
            <path 
              d="M 15% 75% Q 30% 60% 50% 50% T 82% 28%" 
              fill="none" 
              stroke="#FFB020" 
              strokeWidth="3.5" 
              strokeDasharray="8 6" 
              strokeOpacity="0.55" 
            />
            <path 
              d="M 50% 50% Q 65% 65% 82% 78%" 
              fill="none" 
              stroke="#FFB020" 
              strokeWidth="2.5" 
              strokeDasharray="6 4" 
              strokeOpacity="0.45" 
            />
          </svg>

          {/* Mining Zones Visual Boxes */}
          {MINE_MAP_ZONES.map((zone, zIdx) => {
            if (!zone.bounds) return null;
            const width = Math.max(0, zone.bounds.xMax - zone.bounds.xMin);
            const height = Math.max(0, zone.bounds.yMax - zone.bounds.yMin);
            return (
              <div
                key={`map-zone-${zone.id}-${zIdx}`}
                className="absolute border border-dashed rounded-xl pointer-events-none flex flex-col justify-end p-1.5 transition-opacity"
                style={{
                  left: `${zone.bounds.xMin}%`,
                  top: `${zone.bounds.yMin}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  borderColor: `${zone.color}55`,
                  backgroundColor: `${zone.color}0D`,
                }}
              >
                <span 
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm self-start whitespace-nowrap overflow-hidden max-w-full text-ellipsis"
                  style={{ color: zone.color, backgroundColor: `${zone.color}25` }}
                >
                  {zone.nameFa.split('(')[0]}
                </span>
              </div>
            );
          })}

          {/* Equipment Live Markers */}
          {filteredEquipment.map((eq, eqIdx) => {
            const isSelected = selectedEquipment?.id === eq.id;
            const statusConfig = getStatusBadge(eq.status);

            return (
              <div
                key={`map-eq-${eq.id}-${eqIdx}`}
                onClick={() => setSelectedEquipment(isSelected ? null : eq)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group z-20 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                }`}
                style={{
                  left: `${eq.position.x}%`,
                  top: `${eq.position.y}%`,
                }}
              >
                {/* Ping Pulse for Active Equipment */}
                {(eq.status === 'ACTIVE' || eq.status === 'HAULING') && (
                  <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none" />
                )}

                {/* Marker Pin */}
                <div 
                  className={`p-1.5 rounded-xl border flex items-center gap-1 shadow-lg transition-all ${
                    isSelected
                      ? 'bg-[#00D2FF] text-slate-950 border-white shadow-[0_0_16px_rgba(0,210,255,0.7)]'
                      : isDark
                      ? 'bg-[#121B3B] border-[#24356B] text-[#F1F5F9] hover:border-[#00D2FF]/60'
                      : 'bg-white border-slate-300 text-slate-900 shadow-md'
                  }`}
                >
                  <EquipmentVectorIcon 
                    category={eq.category} 
                    className="w-4 h-4" 
                    size={16} 
                  />
                  <span className="text-[10px] font-black font-mono tracking-tight px-0.5">
                    {eq.code}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Equipment Floating Info Drawer */}
        {selectedEquipment && (
          <div 
            className={`absolute bottom-3 right-3 left-3 sm:left-auto sm:w-84 rounded-2xl border p-3.5 z-40 backdrop-blur-2xl shadow-2xl transition-all ${
              isDark 
                ? 'bg-[#121B3B]/95 border-[#24356B] text-[#F1F5F9] ring-1 ring-[#00D2FF]/30' 
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
            }`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex items-start justify-between gap-2 border-b border-[#24356B]/30 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center justify-center font-bold">
                  <EquipmentVectorIcon category={selectedEquipment.category} size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black">{selectedEquipment.nameFa}</h4>
                  <span className="text-[10px] font-mono text-[#00D2FF] font-bold">{selectedEquipment.code} | {selectedEquipment.model}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEquipment(null)}
                className="text-[#8E9EB8] hover:text-[#F1F5F9] text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
              <div className="flex items-center gap-1 text-[#8E9EB8]">
                <User className="w-3 h-3 text-[#00D2FF]" />
                <span className="truncate">{selectedEquipment.operatorName}</span>
              </div>
              <div className="flex items-center gap-1 text-[#8E9EB8]">
                <MapPin className="w-3 h-3 text-[#FFB020]" />
                <span className="truncate">پله {selectedEquipment.position.benchLevel}m</span>
              </div>
              <div className="flex items-center gap-1 text-[#8E9EB8]">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span className="font-mono">{selectedEquipment.dailyStats.operatingHoursToday} ساعت کار</span>
              </div>
              <div className="flex items-center gap-1 text-[#8E9EB8]">
                <Fuel className="w-3 h-3 text-amber-400" />
                <span className="font-mono">{selectedEquipment.dailyStats.fuelConsumedLitersToday} لیتر</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#141F42]/80 border border-[#24356B]/40 text-[10px] text-[#8E9EB8] mb-2 leading-relaxed">
              <span className="text-[#F1F5F9] font-bold">فعالیت جاری: </span>
              <span>{selectedEquipment.currentActivityFa}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedEquipment.status).color}`}>
                {getStatusBadge(selectedEquipment.status).label}
              </span>

              <button
                onClick={() => navigate('/equipment')}
                className="text-[11px] text-[#00D2FF] hover:underline font-bold flex items-center gap-1"
              >
                <span>مشاهده پرونده کامل</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fleet Live Summary Indicators Footer */}
      <div className={`mt-4 pt-3.5 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
        isDark ? 'border-[#24356B]/30' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[#8E9EB8]">فعال در عملیات:</span>
          <span className="font-mono font-black text-[#F1F5F9]">{summary.activeCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-[#8E9EB8]">آماده‌به‌کار / استندبای:</span>
          <span className="font-mono font-black text-[#F1F5F9]">{summary.standbyCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="text-[#8E9EB8]">در حال تعمیر / نت:</span>
          <span className="font-mono font-black text-[#F1F5F9]">{summary.maintenanceCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D2FF]" />
          <span className="text-[#8E9EB8]">نرخ آماده‌به‌کاری:</span>
          <span className="font-mono font-black text-[#00D2FF]">{summary.availabilityRatePct}٪</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardEquipmentMapCard;
