// src/modules/dashboard/presentation/components/CostDistribution.tsx

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface CostDistributionProps {
  isDark: boolean;
}

const data = [
  { name: 'حفاری و آتشباری', value: 34, color: '#00D4FF' },
  { name: 'بارگیری و حمل', value: 28, color: '#C9A227' },
  { name: 'خردایش و سرند', value: 22, color: '#A29BFE' },
  { name: 'سوخت و نگهداری', value: 16, color: '#FF9F43' },
];

export const CostDistribution: React.FC<CostDistributionProps> = ({ isDark }) => {
  return (
    <div className="w-full h-56 flex flex-col justify-center items-center">
      <div className="w-full h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#13203A' : '#FFFFFF', 
                borderColor: isDark ? '#2A3A5A' : '#CBD5E1',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#FFFFFF' : '#0F172A'
              }} 
              formatter={(value: any) => [`${value}٪`, 'سهم از کل هزینه']}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={58}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className={isDark ? 'text-[#8A9DB0]' : 'text-slate-600'}>{item.name}</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value}٪</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostDistribution;
