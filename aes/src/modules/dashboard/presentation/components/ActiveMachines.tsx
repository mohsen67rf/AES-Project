// src/modules/dashboard/presentation/components/ActiveMachines.tsx

const machines = [
  { name: 'بیل مکانیکی', count: 12, status: 'فعال' },
  { name: 'کامیون معدن', count: 34, status: 'فعال' },
  { name: 'دستگاه حفاری', count: 8, status: 'غیرفعال' },
  { name: 'نوار نقاله', count: 24, status: 'فعال' },
];

export function ActiveMachines() {
  return (
    <div className="space-y-3">
      {machines.map((machine) => (
        <div key={machine.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <span className="text-gray-300 text-sm">{machine.name}</span>
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">{machine.count}</span>
            <div className={`w-2 h-2 rounded-full ${machine.status === 'فعال' ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}