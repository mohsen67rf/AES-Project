// src/modules/dashboard/presentation/components/RecentAlertsCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { 
  BoltIcon, 
  ExclamationCircleIcon, 
  WrenchIcon, 
  ShieldExclamationIcon 
} from '@heroicons/react/24/outline';

export const RecentAlertsCard: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRtl = language === 'fa';

  const alerts = [
    {
      id: 'alert-1',
      title: 'High Vibration Detected',
      titleFa: 'ثبت لرزش بیش از حد استاندارد',
      target: 'Crusher #2 • Mine A',
      targetFa: 'سنگ‌شکن ۲ • معدن چادرملو',
      time: '2 min ago',
      timeFa: '۲ دقیقه پیش',
      icon: BoltIcon,
      bgColor: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
      dotColor: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    },
    {
      id: 'alert-2',
      title: 'Low Fuel Level',
      titleFa: 'سطح سوخت گازوئیل پایین',
      target: 'Haul Truck #12 • Mine B',
      targetFa: 'دامپ‌تراک ۱۲ • معدن گل‌گهر',
      time: '15 min ago',
      timeFa: '۱۵ دقیقه پیش',
      icon: ExclamationCircleIcon,
      bgColor: 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/25',
      dotColor: 'bg-[#FFB020] shadow-[0_0_8px_rgba(255,176,32,0.6)]',
    },
    {
      id: 'alert-3',
      title: 'Maintenance Required',
      titleFa: 'نیازمند سرویس دوره‌ای PM',
      target: 'Excavator #7 • Mine C',
      targetFa: 'شاول حفاری ۷ • معدن سنگان',
      time: '1 hour ago',
      timeFa: '۱ ساعت پیش',
      icon: WrenchIcon,
      bgColor: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    },
    {
      id: 'alert-4',
      title: 'Safety Inspection Due',
      titleFa: 'موعد بازرسی ایمنی پله استخراج',
      target: 'Mine D',
      targetFa: 'پیت مرکزی معدن D',
      time: '3 hours ago',
      timeFa: '۳ ساعت پیش',
      icon: ShieldExclamationIcon,
      bgColor: 'bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/25',
      dotColor: 'bg-[#00D2FF] shadow-[0_0_8px_rgba(0,210,255,0.6)]',
    },
  ];

  return (
    <div 
      className={`rounded-[22px] p-5.5 border transition-all duration-300 flex flex-col justify-between h-[350px] ${
        isDark 
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9] shadow-[0_12px_32px_rgba(7,11,26,0.5)]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black tracking-tight text-[#F1F5F9]">
          {isRtl ? 'هشدارها و وقایع جاری' : 'Recent Alerts'}
        </h3>
        <button 
          onClick={() => navigate('/alerts')}
          className="px-3 py-1 rounded-full text-xs font-bold text-[#00D2FF] bg-[#141F42] hover:bg-[#1E2D5C] border border-[#24356B]/40 transition-all cursor-pointer"
        >
          {isRtl ? 'مشاهده همه' : 'View All'}
        </button>
      </div>

      {/* Alert List Items */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {alerts.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={`recent-alert-${item.id}-${idx}`}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-[#141F42] border-[#24356B]/25 hover:bg-[#1E2D5C] hover:border-[#00D2FF]/30' 
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${item.bgColor}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight text-[#F1F5F9]">
                    {isRtl ? item.titleFa : item.title}
                  </h4>
                  <span className="text-[10px] text-[#8E9EB8] block mt-0.5">
                    {isRtl ? item.targetFa : item.target}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8E9EB8] font-medium">
                  {isRtl ? item.timeFa : item.time}
                </span>
                <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentAlertsCard;
