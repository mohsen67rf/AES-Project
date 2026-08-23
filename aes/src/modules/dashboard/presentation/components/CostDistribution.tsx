// src/modules/dashboard/presentation/components/CostDistribution.tsx

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { motion } from 'framer-motion';
import { useState } from 'react';

// ============================================
// پالت رنگی
// ============================================

const COLORS = {
  gold: '#C9A227',
  goldLight: '#E8C84A',
  teal: '#00B8D9',
  green: '#4ECDC4',
  purple: '#A29BFE',
  navy: '#1A2A3A',
  navyLight: '#2A3A5A',
  white: '#FFFFFF',
  gray: '#8A9DB0',
};

// ============================================
// داده‌ها
// ============================================

const data = [
  { name: 'استخراج', value: 45, color: COLORS.gold },
  { name: 'حمل و نقل', value: 25, color: COLORS.teal },
  { name: 'تعمیرات', value: 20, color: COLORS.green },
  { name: 'سایر', value: 10, color: COLORS.purple },
];

interface CostDistributionProps {
  isDark?: boolean;
}

// ============================================
// کامپوننت بخش فعال (با useMemo برای جلوگیری از re-render)
// ============================================

const renderActiveShape = (props: any, isDark: boolean) => {
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill={isDark ? '#FFFFFF' : '#1A2A3A'} fontSize={14} fontWeight={600}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={12} textAnchor="middle" fill={COLORS.gold} fontSize={16} fontWeight={700}>
        {`${value}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.9}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={isDark ? '#8A9DB0' : '#4A6A8A'} fontSize={11}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

// ============================================
// کامپوننت اصلی
// ============================================

export function CostDistribution({ isDark = true }: CostDistributionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // ✅ فرمتر صحیح برای Tooltip
  const customTooltipFormatter = (value: any, name: any) => {
    if (typeof value === 'number') {
      return [`${value}%`, name];
    }
    return [String(value), name];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            onMouseEnter={onPieEnter}
            activeShape={(props: any) => renderActiveShape(props, isDark)}
            // ❌ activeIndex رو حذف کردیم - در نسخه جدید پشتیبانی نمیشه
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#gradient-${index})`}
                stroke={isDark ? '#0A1628' : '#FFFFFF'}
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#13203A' : '#FFFFFF',
              borderColor: COLORS.gold,
              borderRadius: 12,
              padding: '8px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            labelStyle={{ color: isDark ? '#FFFFFF' : '#1A2A3A', fontWeight: 600 }}
            formatter={customTooltipFormatter}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default CostDistribution;