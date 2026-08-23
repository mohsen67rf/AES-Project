// src/modules/dashboard/presentation/components/ProcessingEfficiencyChart.tsx

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from 'recharts';

interface ProcessingEfficiencyChartProps {
  data: { week: string; efficiency: number; target: number }[];
  isDark?: boolean;
}

export function ProcessingEfficiencyChart({ data, isDark = true }: ProcessingEfficiencyChartProps) {
  const textColor = isDark ? '#8A9DB0' : '#4A6A8A';
  const gridColor = isDark ? '#2A3A5A' : '#E5E7EB';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#00D4FF' : '#C9A227'} stopOpacity={0.3} />
            <stop offset="100%" stopColor={isDark ? '#00D4FF' : '#C9A227'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.2} vertical={false} />
        <XAxis dataKey="week" stroke={textColor} fontSize={10} tickLine={false} axisLine={{ stroke: gridColor, opacity: 0.2 }} />
        <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <Tooltip contentStyle={{ backgroundColor: isDark ? '#13203A' : '#FFFFFF', borderColor: isDark ? '#2A3A5A' : '#E5E7EB', borderRadius: 12, padding: '8px 14px' }} labelStyle={{ color: isDark ? '#FFFFFF' : '#1A2A3A', fontWeight: 600 }} formatter={(value: any) => [`${value}%`, '']} />
        <Area type="monotone" dataKey="efficiency" stroke={isDark ? '#00D4FF' : '#C9A227'} strokeWidth={2} fill="url(#efficiencyGradient)" />
        <Line type="monotone" dataKey="target" stroke={isDark ? '#4A6A8A' : '#B0B8C0'} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}