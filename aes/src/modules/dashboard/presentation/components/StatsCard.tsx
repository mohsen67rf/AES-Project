// src/modules/dashboard/presentation/components/StatsCard.tsx

import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: any;  // ← هر چیزی رو قبول کن
  color: string;
}

export function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  const isPositive = change.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.3 },
      }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-brand-primary/40 transition-all duration-300 shadow-lg hover:shadow-brand-primary/10"
    >
      {/* درخشش حرکت‌دهنده */}
      <div className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1 dark:text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">نسبت به ماه قبل</span>
        </div>
      </div>
    </motion.div>
  );
}