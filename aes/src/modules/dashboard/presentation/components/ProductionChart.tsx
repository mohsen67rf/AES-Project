// src/modules/dashboard/presentation/components/ProductionChart.tsx

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { day: 'شنبه', value: 1200 },
  { day: 'یکشنبه', value: 1400 },
  { day: 'دوشنبه', value: 1100 },
  { day: 'سه‌شنبه', value: 1800 },
  { day: 'چهارشنبه', value: 1600 },
  { day: 'پنجشنبه', value: 2000 },
  { day: 'جمعه', value: 1500 },
];

export function ProductionChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="day" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#C9A227' }}
          labelStyle={{ color: '#fff' }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#C9A227" 
          strokeWidth={2}
          dot={{ fill: '#C9A227', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}