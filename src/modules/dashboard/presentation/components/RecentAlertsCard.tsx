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
      bgColor: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
      dotColor: 'bg-rose-500',
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
      bgColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
      dotColor: 'bg-amber-500',
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
      bgColor: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      dotColor: 'bg-yellow-500',
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
      bgColor: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
      dotColor: 'bg-cyan-500',
    },
  ];

  return (
    <div 
      className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between h-[340px] ${
        isDark 
          ? 'bg-[#111726]/80 border-[#1E293B] text-white shadow-lg backdrop-blur-xl' 
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black tracking-tight">
          {isRtl ? 'هشدارها و رخدادهای اخیر' : 'Recent Alerts'}
        </h3>
        <button 
          onClick={() => navigate('/alerts')}
          className="text-xs font-bold text-[#7C3AED] hover:text-[#9333EA] dark:text-[#A78BFA] transition-colors"
        >
          {isRtl ? 'مشاهده همه >' : 'View All >'}
        </button>
      </div>

      {/* Alert List Items */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {alerts.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-[#090D16]/60 border-[#1E293B] hover:bg-[#151D2F] hover:border-slate-700' 
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.bgColor}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">
                    {isRtl ? item.titleFa : item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {isRtl ? item.targetFa : item.target}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  {isRtl ? item.timeFa : item.time}
                </span>
                <span className={`w-2 h-2 rounded-full ${item.dotColor} shadow-sm animate-pulse`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentAlertsCard;
