// src/modules/dashboard/presentation/components/ProductionChart.tsx

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from 'recharts';
import { motion } from 'framer-motion';

// ============================================
// پالت رنگی
// ============================================

const COLORS = {
  gold: '#C9A227',
  goldLight: '#E8C84A',
  navy: '#1A2A3A',
  navyLight: '#2A3A5A',
  teal: '#00B8D9',
  white: '#FFFFFF',
  gray: '#8A9DB0',
  darkBg: '#0A1628',
};

// ============================================
// داده‌ها
// ============================================

const data = [
  { day: 'شنبه', production: 1200 },
  { day: 'یکشنبه', production: 1400 },
  { day: 'دوشنبه', production: 1100 },
  { day: 'سه‌شنبه', production: 1800 },
  { day: 'چهارشنبه', production: 1600 },
  { day: 'پنجشنبه', production: 2000 },
  { day: 'جمعه', production: 1500 },
];

interface ProductionChartProps {
  isDark?: boolean;
}

// ============================================
// کامپوننت
// ============================================

export function ProductionChart({ isDark = true }: ProductionChartProps) {
  const textColor = isDark ? '#8A9DB0' : '#4A6A8A';
  const gridColor = isDark ? '#2A3A5A' : '#E5E7EB';

  // ✅ فرمتر صحیح برای Tooltip
  const customTooltipFormatter = (value: any, name: any) => {
    if (typeof value === 'number') {
      return [`${value.toLocaleString()} تن`, name];
    }
    return [String(value), name];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={gridColor} 
            opacity={0.3} 
            vertical={false}
          />
          
          <XAxis 
            dataKey="day" 
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor, opacity: 0.2 }}
          />
          
          <YAxis 
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value/1000).toFixed(1)}k`}
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#13203A' : '#FFFFFF', 
              borderColor: COLORS.gold,
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            labelStyle={{ color: isDark ? '#FFFFFF' : '#1A2A3A', fontWeight: 600 }}
            itemStyle={{ color: isDark ? '#E8EDF5' : '#1A2A3A' }}
            formatter={customTooltipFormatter}
            labelFormatter={(label) => `${label}`}
          />

          <Area
            type="monotone"
            dataKey="production"
            stroke={COLORS.gold}
            strokeWidth={0}
            fill="url(#productionGradient)"
          />

          <Line
            type="monotone"
            dataKey="production"
            stroke={COLORS.gold}
            strokeWidth={3}
            dot={{
              fill: COLORS.gold,
              stroke: isDark ? '#0A1628' : '#FFFFFF',
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              fill: COLORS.goldLight,
              stroke: COLORS.gold,
              strokeWidth: 3,
              r: 8,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default ProductionChart;