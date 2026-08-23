// src/modules/dashboard/presentation/components/BlockStatusChart.tsx

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface BlockStatusChartProps {
  data: { status: string; count: number; color: string }[];
  isDark?: boolean;
}

export function BlockStatusChart({ data, isDark = true }: BlockStatusChartProps) {
  const textColor = isDark ? '#8A9DB0' : '#4A6A8A';
  const gridColor = isDark ? '#2A3A5A' : '#E5E7EB';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.2} vertical={false} />
        <XAxis dataKey="status" stroke={textColor} fontSize={10} tickLine={false} axisLine={{ stroke: gridColor, opacity: 0.2 }} />
        <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ backgroundColor: isDark ? '#13203A' : '#FFFFFF', borderColor: isDark ? '#2A3A5A' : '#E5E7EB', borderRadius: 12, padding: '8px 14px' }} labelStyle={{ color: isDark ? '#FFFFFF' : '#1A2A3A', fontWeight: 600 }} formatter={(value: any) => [`${value} بلوک`, '']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}