// src/modules/equipment/presentation/components/EquipmentVectorIcons.tsx

import React from 'react';
import { EquipmentCategory } from '../../domain/types/equipment.types';

interface EquipmentIconProps {
  className?: string;
  size?: number | string;
  color?: string;
  fillOpacity?: number;
}

/**
 * وکتور اختصاصی بیل مکانیکی / شاول هیدرولیکی
 */
export const ExcavatorVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#F59E0B" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* شنی و زنجیر زیربندی */}
    <rect x="3" y="24" width="16" height="5" rx="2.5" fill="#334155" stroke="#64748B" strokeWidth="1" />
    <circle cx="5.5" cy="26.5" r="1.5" fill="#94A3B8" />
    <circle cx="11" cy="26.5" r="1.5" fill="#94A3B8" />
    <circle cx="16.5" cy="26.5" r="1.5" fill="#94A3B8" />
    {/* بدنه و کابین چرخان */}
    <rect x="5" y="17" width="11" height="7" rx="2" fill={color} />
    <rect x="10" y="18" width="5" height="4" rx="1" fill="#38BDF8" fillOpacity="0.8" />
    <rect x="5" y="19" width="3" height="4" rx="1" fill="#0F172A" />
    {/* بوم و بازو (Boom & Stick) */}
    <path d="M 14 19 L 21 10 L 27 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* باکت (Bucket) */}
    <path d="M 27 15 L 29 19 L 25 21 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
    {/* جک‌های هیدرولیک */}
    <path d="M 12 21 L 18 13" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/**
 * وکتور اختصاصی لودر چرخ لاستیکی
 */
export const LoaderVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#F59E0B" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* چرخ‌های لاستیکی غول‌پیکر */}
    <circle cx="8" cy="25" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
    <circle cx="8" cy="25" r="2" fill="#E2E8F0" />
    <circle cx="21" cy="25" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
    <circle cx="21" cy="25" r="2" fill="#E2E8F0" />
    {/* شاسی و کابین */}
    <rect x="6" y="15" width="13" height="7" rx="2" fill={color} />
    <path d="M 10 15 L 12 10 L 17 10 L 18 15 Z" fill={color} />
    <rect x="13" y="11" width="4" height="4" rx="0.8" fill="#38BDF8" fillOpacity="0.8" />
    {/* بازوی بالابر هیدرولیکی */}
    <path d="M 17 18 L 26 17 L 28 22" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    {/* باکت جلو */}
    <path d="M 27 18 L 30 20 L 29 26 L 25 26 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
  </svg>
);

/**
 * وکتور اختصاصی دامپتراک معدنی سنگین (100T, 60T, 35T)
 */
export const DumpTruckVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#F59E0B" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* چرخ‌های غول‌آسا */}
    <circle cx="9" cy="24" r="5" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
    <circle cx="9" cy="24" r="2" fill="#E2E8F0" />
    <circle cx="23" cy="24" r="5" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
    <circle cx="23" cy="24" r="2" fill="#E2E8F0" />
    {/* لگن بار عقب (Dump Bed) */}
    <path d="M 5 9 L 19 9 L 20 19 L 5 19 Z" fill={color} stroke="#B45309" strokeWidth="1" />
    <path d="M 5 9 L 3 13 L 5 19 Z" fill="#D97706" />
    <path d="M 19 9 L 23 7 L 23 12 L 20 19 Z" fill="#FBBF24" />
    {/* کابین راننده و کانوپی بالای سر */}
    <rect x="20" y="13" width="8" height="7" rx="1.5" fill={color} />
    <rect x="23" y="14" width="4" height="3" rx="0.5" fill="#38BDF8" fillOpacity="0.8" />
    {/* گارد جلو و پله دسترسی */}
    <rect x="27" y="17" width="2" height="4" fill="#64748B" />
  </svg>
);

/**
 * وکتور دستگاه دریل واگن و حفاری پودری / ناریه
 */
export const DrillRigVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#06B6D4" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* زنجیر زیربندی */}
    <rect x="4" y="24" width="14" height="4" rx="2" fill="#334155" />
    <circle cx="6" cy="26" r="1" fill="#94A3B8" />
    <circle cx="11" cy="26" r="1" fill="#94A3B8" />
    <circle cx="16" cy="26" r="1" fill="#94A3B8" />
    {/* بدنه و موتور کمپرسور */}
    <rect x="5" y="18" width="10" height="6" rx="1.5" fill={color} />
    <rect x="6" y="19" width="3" height="3" fill="#0F172A" />
    {/* دکل حفاری عمودی (Mast) */}
    <rect x="20" y="3" width="3.5" height="25" rx="1" fill="#475569" stroke="#E2E8F0" strokeWidth="0.8" />
    <path d="M 21.7 4 L 21.7 26" stroke="#00D4FF" strokeWidth="1" strokeDasharray="2,2" />
    {/* سر مته و چکش نفوذی */}
    <polygon points="20,27 23.5,27 21.75,30" fill="#E2E8F0" />
    {/* بازوی نگهدارنده دکل */}
    <path d="M 14 19 L 20 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * وکتور بولدوزر سنگین شنی‌دار
 */
export const BulldozerVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#EAB308" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* زنجیر ممتد بولدوزر */}
    <path d="M 6 22 L 20 22 L 22 27 L 4 27 Z" fill="#1E293B" stroke="#475569" strokeWidth="1" />
    <circle cx="7" cy="25" r="1.5" fill="#94A3B8" />
    <circle cx="13" cy="25" r="1.5" fill="#94A3B8" />
    <circle cx="19" cy="25" r="1.5" fill="#94A3B8" />
    {/* بدنه و کابین محافظ ROPS */}
    <rect x="7" y="14" width="12" height="8" rx="1.5" fill={color} />
    <rect x="9" y="10" width="7" height="5" rx="1" fill={color} />
    <rect x="10" y="11" width="5" height="3" rx="0.5" fill="#38BDF8" fillOpacity="0.8" />
    {/* تیغه سنگین جلو (Blade) */}
    <path d="M 23 16 L 27 16 C 28.5 19 28.5 24 26 27 L 22 27" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
    {/* ریپر پشت (Ripper) */}
    <path d="M 5 21 L 2 24 L 2 27" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * وکتور چکش هیدرولیکی (پیکور)
 */
export const HydraulicBreakerVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#EF4444" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* شنی */}
    <rect x="3" y="24" width="15" height="5" rx="2.5" fill="#334155" />
    <circle cx="5.5" cy="26.5" r="1.5" fill="#94A3B8" />
    <circle cx="11" cy="26.5" r="1.5" fill="#94A3B8" />
    <circle cx="16" cy="26.5" r="1.5" fill="#94A3B8" />
    {/* بدنه */}
    <rect x="5" y="17" width="11" height="7" rx="2" fill={color} />
    <rect x="10" y="18" width="5" height="4" rx="1" fill="#38BDF8" fillOpacity="0.8" />
    {/* بوم هیدرولیک */}
    <path d="M 14 19 L 20 10 L 25 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* چکش پیکور و قلم فولادی */}
    <rect x="24" y="13" width="4" height="8" rx="1" fill="#475569" stroke="#E2E8F0" strokeWidth="0.8" />
    <polygon points="25,21 27,21 26,27" fill="#CBD5E1" />
  </svg>
);

/**
 * وکتور گریدر تسطیح جاده
 */
export const MotorGraderVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#F59E0B" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* چرخ‌های عقب تاندم */}
    <circle cx="6" cy="24" r="3.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
    <circle cx="12" cy="24" r="3.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
    {/* چرخ جلو */}
    <circle cx="27" cy="24" r="3.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
    {/* کابین مرتفع عقب */}
    <rect x="8" y="12" width="7" height="8" rx="1.5" fill={color} />
    <rect x="10" y="13" width="4" height="4" rx="0.5" fill="#38BDF8" fillOpacity="0.8" />
    {/* شاسی کشیده و باریک به جلو */}
    <path d="M 14 17 L 27 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* تیغه میانی تسطیح (Moldboard) */}
    <path d="M 17 26 L 22 23" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * وکتور تانکر آب‌پاش معدنی
 */
export const WaterTruckVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#0284C7" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="8" cy="24" r="4" fill="#0F172A" stroke="#475569" strokeWidth="1.2" />
    <circle cx="22" cy="24" r="4" fill="#0F172A" stroke="#475569" strokeWidth="1.2" />
    {/* مخزن آب استوانه‌ای */}
    <rect x="4" y="11" width="16" height="9" rx="4.5" fill={color} stroke="#38BDF8" strokeWidth="1" />
    {/* کابین */}
    <rect x="20" y="14" width="7" height="7" rx="1.5" fill="#475569" />
    <rect x="22" y="15" width="4" height="3" rx="0.5" fill="#38BDF8" fillOpacity="0.8" />
    {/* آب‌پاش و قطرات */}
    <path d="M 3 16 Q 1 18 2 21" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1,1.5" />
  </svg>
);

/**
 * وکتور کامیون سوخت‌رسان و سرویس
 */
export const FuelTruckVector: React.FC<EquipmentIconProps> = ({ 
  className = "w-5 h-5", 
  size = 24, 
  color = "#D946EF" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="8" cy="24" r="4" fill="#0F172A" stroke="#475569" strokeWidth="1.2" />
    <circle cx="22" cy="24" r="4" fill="#0F172A" stroke="#475569" strokeWidth="1.2" />
    {/* مخزن سوخت با نماد سوخت */}
    <rect x="4" y="11" width="16" height="9" rx="3" fill={color} stroke="#E879F9" strokeWidth="1" />
    <path d="M 12 13 L 10 16 L 12 16 L 11 19" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    {/* کابین */}
    <rect x="20" y="14" width="7" height="7" rx="1.5" fill="#334155" />
    <rect x="22" y="15" width="4" height="3" rx="0.5" fill="#38BDF8" fillOpacity="0.8" />
  </svg>
);

/**
 * رندر کننده یکپارچه بر اساس دسته‌بندی
 */
export const EquipmentVectorIcon: React.FC<{
  category: EquipmentCategory;
  className?: string;
  size?: number | string;
  color?: string;
}> = ({ category, className = "w-5 h-5", size = 24, color }) => {
  switch (category) {
    case 'EXCAVATOR':
      return <ExcavatorVector className={className} size={size} color={color || "#F59E0B"} />;
    case 'LOADER':
      return <LoaderVector className={className} size={size} color={color || "#EAB308"} />;
    case 'DUMP_TRUCK_100T':
    case 'DUMP_TRUCK_60T':
    case 'DUMP_TRUCK_35T':
      return <DumpTruckVector className={className} size={size} color={color || "#F97316"} />;
    case 'DRILL_RIG':
      return <DrillRigVector className={className} size={size} color={color || "#06B6D4"} />;
    case 'BULLDOZER':
      return <BulldozerVector className={className} size={size} color={color || "#EAB308"} />;
    case 'HYDRAULIC_BREAKER':
      return <HydraulicBreakerVector className={className} size={size} color={color || "#EF4444"} />;
    case 'MOTOR_GRADER':
      return <MotorGraderVector className={className} size={size} color={color || "#F59E0B"} />;
    case 'WATER_TRUCK':
      return <WaterTruckVector className={className} size={size} color={color || "#0284C7"} />;
    case 'SERVICE_FUEL_TRUCK':
      return <FuelTruckVector className={className} size={size} color={color || "#D946EF"} />;
    default:
      return <ExcavatorVector className={className} size={size} color={color || "#F59E0B"} />;
  }
};
