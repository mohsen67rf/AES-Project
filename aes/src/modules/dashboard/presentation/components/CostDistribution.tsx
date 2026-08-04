// src/modules/dashboard/presentation/components/CostDistribution.tsx

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'استخراج', value: 45 },
  { name: 'حمل و نقل', value: 25 },
  { name: 'تعمیرات', value: 20 },
  { name: 'سایر', value: 10 },
];

const COLORS = ['#C9A227', '#F4A460', '#2A2F38', '#00B8D9'];

export function CostDistribution() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}