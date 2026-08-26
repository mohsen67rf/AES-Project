// src/modules/dashboard/presentation/components/ProductionChart.tsx

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ProductionChartProps {
  isDark: boolean;
}

const data = [
  { name: 'شنبه', target: 4500, actual: 4800, grade: 56.4 },
  { name: 'یکشنبه', target: 4500, actual: 4300, grade: 55.8 },
  { name: 'دوشنبه', target: 4600, actual: 4950, grade: 57.1 },
  { name: 'سه‌شنبه', target: 4700, actual: 4650, grade: 56.9 },
  { name: 'چهارشنبه', target: 4800, actual: 5100, grade: 58.2 },
  { name: 'پنج‌شنبه', target: 4500, actual: 4400, grade: 55.2 },
  { name: 'جمعه', target: 4000, actual: 4200, grade: 56.0 },
];

export const ProductionChart: React.FC<ProductionChartProps> = ({ isDark }) => {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A227" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#C9A227" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#2A3A5A' : '#E2E8F0'} 
            opacity={0.5} 
          />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? '#8A9DB0' : '#64748B'} 
            fontSize={11} 
            tickLine={false}
          />
          <YAxis 
            stroke={isDark ? '#8A9DB0' : '#64748B'} 
            fontSize={11} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#13203A' : '#FFFFFF', 
              borderColor: isDark ? '#2A3A5A' : '#CBD5E1',
              borderRadius: '12px',
              fontSize: '12px',
              color: isDark ? '#FFFFFF' : '#0F172A',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }} 
            formatter={(value: any, name: any) => [
              `${Number(value).toLocaleString()} تن`, 
              name === 'actual' ? 'استخراج واقعی' : 'برنامه هدف'
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#00D4FF" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#actualGradient)" 
          />
          <Area 
            type="monotone" 
            dataKey="target" 
            stroke="#C9A227" 
            strokeWidth={1.5} 
            strokeDasharray="4 4" 
            fillOpacity={1} 
            fill="url(#targetGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionChart;
