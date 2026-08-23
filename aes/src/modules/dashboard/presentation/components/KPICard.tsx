// src/modules/dashboard/presentation/components/KPICard.tsx

import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  subtitle?: string;
  icon: React.ReactNode;
  isDark?: boolean;
}

export function KPICard({ title, value, change, subtitle, icon, isDark = true }: KPICardProps) {
  const isPositive = change?.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
        isDark ? 'bg-[#13203A]/80 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40' : 'bg-white/80 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40'
      }`}
    >
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 ${
        isDark ? 'bg-[#00D4FF]' : 'bg-[#C9A227]'
      }`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#00D4FF]/10' : 'bg-[#C9A227]/10'}`}>
              {icon}
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'}`}>{title}</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#1A2A3A]'}`}>{value}</p>
            </div>
          </div>
          {change && (
            <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
              isPositive ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {change}
            </div>
          )}
        </div>
        {subtitle && (
          <p className={`text-[10px] mt-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}