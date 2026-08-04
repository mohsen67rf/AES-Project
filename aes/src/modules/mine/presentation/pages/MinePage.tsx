// src/modules/mine/presentation/pages/MinePage.tsx

import { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ============================================
// نوع‌های داده (تعریف داخل خود فایل)
// ============================================

interface Mine {
  id: string;
  name: string;
  code: string;
  location: string;
  status: 'فعال' | 'غیرفعال' | 'در حال بهره‌برداری' | 'متوقف';
  createdAt: string;
}

interface Pit {
  id: string;
  mineId: string;
  name: string;
  code: string;
  status: 'فعال' | 'غیرفعال';
  geometry?: any;
  createdAt: string;
}

// ============================================
// سرویس‌های دیتابیس (داخل خود فایل)
// ============================================

const MINES_KEY = 'aes_mines';
const PITS_KEY = 'aes_pits';

function getMines(): Mine[] {
  try {
    const data = localStorage.getItem(MINES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getMineById(id: string): Mine | null {
  const mines = getMines();
  return mines.find(m => m.id === id) || null;
}

function getPits(mineId?: string): Pit[] {
  try {
    const data = localStorage.getItem(PITS_KEY);
    const pits: Pit[] = data ? JSON.parse(data) : [];
    return mineId ? pits.filter(p => p.mineId === mineId) : pits;
  } catch {
    return [];
  }
}

function addPit(pit: Omit<Pit, 'id' | 'createdAt'>): Pit {
  const pits = getPits();
  const newPit: Pit = {
    id: crypto.randomUUID(),
    ...pit,
    createdAt: new Date().toISOString(),
  };
  pits.push(newPit);
  localStorage.setItem(PITS_KEY, JSON.stringify(pits));
  return newPit;
}

function deletePit(id: string): boolean {
  const pits = getPits();
  const newPits = pits.filter(p => p.id !== id);
  localStorage.setItem(PITS_KEY, JSON.stringify(newPits));
  return newPits.length !== pits.length;
}

// ============================================
// کامپوننت صفحه‌ی معدن
// ============================================

interface MinePageProps {
  mineId: string;
  onBack?: () => void;
}

export function MinePage({ mineId, onBack }: MinePageProps) {
  const [mine, setMine] = useState<Mine | null>(null);
  const [pits, setPits] = useState<Pit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPit, setShowAddPit] = useState(false);
  const [newPitName, setNewPitName] = useState('');
  const [newPitCode, setNewPitCode] = useState('');
  const [newPitStatus, setNewPitStatus] = useState<'فعال' | 'غیرفعال'>('فعال');

  useEffect(() => {
    const mineData = getMineById(mineId);
    setMine(mineData);
    
    if (mineData) {
      const pitsData = getPits(mineData.id);
      setPits(pitsData);
    }
    
    setLoading(false);
  }, [mineId]);

  const handleDeletePit = (pitId: string) => {
    if (window.confirm('آیا از حذف این پیت اطمینان دارید؟')) {
      deletePit(pitId);
      setPits(pits.filter(p => p.id !== pitId));
    }
  };

  const handleAddPit = () => {
    if (!mine) return;
    if (!newPitName.trim() || !newPitCode.trim()) {
      alert('نام و کد پیت الزامی است');
      return;
    }

    const pit = addPit({
      mineId: mine.id,
      name: newPitName,
      code: newPitCode,
      status: newPitStatus,
    });

    setPits([...pits, pit]);
    setShowAddPit(false);
    setNewPitName('');
    setNewPitCode('');
    setNewPitStatus('فعال');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#8A9DB0]">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!mine) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">معدن مورد نظر یافت نشد!</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    'فعال': 'text-green-400 bg-green-400/10 border-green-400/20',
    'غیرفعال': 'text-red-400 bg-red-400/10 border-red-400/20',
    'در حال بهره‌برداری': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'متوقف': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  return (
    <div className="space-y-6">
      {/* هدر معدن */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{mine.name}</h1>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[mine.status] || 'text-gray-400 border-gray-400/20 bg-gray-400/10'}`}>
              {mine.status}
            </span>
          </div>
          <p className="text-[#8A9DB0] text-sm mt-1">
            {mine.code} • {mine.location}
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-[#AACCDD] bg-[#AACCDD]/10 rounded-xl hover:bg-[#AACCDD]/20 transition-colors"
          >
            ← بازگشت
          </button>
        )}
      </div>

      {/* خلاصه آمار */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#13203A]/40 border border-[#AACCDD]/10 rounded-xl p-4">
          <p className="text-[#8A9DB0] text-sm">تعداد پیت‌ها</p>
          <p className="text-white text-2xl font-bold mt-1">{pits.length}</p>
        </div>
        <div className="bg-[#13203A]/40 border border-[#AACCDD]/10 rounded-xl p-4">
          <p className="text-[#8A9DB0] text-sm">تاریخ ایجاد</p>
          <p className="text-white text-lg font-semibold mt-1">
            {new Date(mine.createdAt).toLocaleDateString('fa-IR')}
          </p>
        </div>
        <div className="bg-[#13203A]/40 border border-[#AACCDD]/10 rounded-xl p-4">
          <p className="text-[#8A9DB0] text-sm">شناسه</p>
          <p className="text-white text-lg font-semibold mt-1">{mine.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* لیست پیت‌ها */}
      <div className="bg-[#13203A]/40 border border-[#AACCDD]/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#E8EDF5] font-semibold flex items-center gap-2">
            <span className="w-1 h-4 bg-[#AACCDD] rounded-full"></span>
            پیت‌های معدن
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[#8A9DB0] text-sm">{pits.length} پیت</span>
            <button
              onClick={() => setShowAddPit(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#1A2A3A] bg-[#AACCDD] rounded-xl hover:bg-[#8A9DB0] transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              افزودن پیت
            </button>
          </div>
        </div>

        {/* مودال افزودن پیت */}
        {showAddPit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#13203A] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">افزودن پیت جدید</h4>
                <button
                  onClick={() => setShowAddPit(false)}
                  className="text-[#8A9DB0] hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#8A9DB0] text-sm mb-1">نام پیت</label>
                  <input
                    type="text"
                    value={newPitName}
                    onChange={(e) => setNewPitName(e.target.value)}
                    placeholder="مثال: پیت شمالی"
                    className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                  />
                </div>

                <div>
                  <label className="block text-[#8A9DB0] text-sm mb-1">کد پیت</label>
                  <input
                    type="text"
                    value={newPitCode}
                    onChange={(e) => setNewPitCode(e.target.value)}
                    placeholder="مثال: PT-002"
                    className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                  />
                </div>

                <div>
                  <label className="block text-[#8A9DB0] text-sm mb-1">وضعیت</label>
                  <select
                    value={newPitStatus}
                    onChange={(e) => setNewPitStatus(e.target.value as 'فعال' | 'غیرفعال')}
                    className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
                  >
                    <option value="فعال">فعال</option>
                    <option value="غیرفعال">غیرفعال</option>
                  </select>
                </div>

                <button
                  onClick={handleAddPit}
                  className="w-full py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-xl hover:bg-[#8A9DB0] transition-colors"
                >
                  افزودن پیت
                </button>
              </div>
            </div>
          </div>
        )}

        {/* لیست پیت‌ها */}
        {pits.length === 0 ? (
          <div className="text-center text-[#8A9DB0] py-8">
            <p>هیچ پیتی برای این معدن وجود ندارد.</p>
            <p className="text-sm mt-1">برای افزودن پیت، روی دکمه‌ی «افزودن پیت» کلیک کنید.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pits.map((pit) => (
              <div
                key={pit.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#AACCDD]/5 border border-[#AACCDD]/10 hover:bg-[#AACCDD]/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#AACCDD]"></div>
                  <div>
                    <p className="text-white font-medium">{pit.name}</p>
                    <p className="text-[#8A9DB0] text-xs">{pit.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${
                    pit.status === 'فعال' 
                      ? 'text-green-400 border-green-400/20 bg-green-400/10' 
                      : 'text-red-400 border-red-400/20 bg-red-400/10'
                  }`}>
                    {pit.status}
                  </span>
                  <button
                    onClick={() => handleDeletePit(pit.id)}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}