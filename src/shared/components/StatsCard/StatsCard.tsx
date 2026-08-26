import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  color?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'text-[#AACCDD]',
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-500 p-5 bg-[#13203A]/80 border border-[#AACCDD]/10 hover:border-[#AACCDD]/30 hover:shadow-lg hover:shadow-[#AACCDD]/5">
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#8A9DB0] text-sm">{title}</p>
            <p className="text-white text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-[#4A6A8A] text-xs mt-0.5">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
