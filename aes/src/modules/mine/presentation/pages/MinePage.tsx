// src/modules/mine/presentation/pages/MinePage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XMarkIcon, MapIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { 
  MineRepository, 
  PitRepository 
} from '../../../../core/infrastructure/repositories';
import type { Mine, Pit } from '../../../../core/domain/types/mine.types';

// ============================================
// کامپوننت صفحه‌ی معدن
// ============================================

interface MinePageProps {
  mineId: string;
  onBack?: () => void;
}

export function MinePage({ mineId, onBack }: MinePageProps) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [mine, setMine] = useState<Mine | null>(null);
  const [pits, setPits] = useState<Pit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPit, setShowAddPit] = useState(false);
  const [newPitName, setNewPitName] = useState('');
  const [newPitCode, setNewPitCode] = useState('');
  const [newPitStatus, setNewPitStatus] = useState<'فعال' | 'غیرفعال'>('فعال');

  // ===== بارگذاری داده =====
  const loadData = () => {
    const mineData = MineRepository.getById(mineId);
    setMine(mineData);
    
    if (mineData) {
      const pitsData = PitRepository.findBy('mineId', mineData.id);
      setPits(pitsData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [mineId]);

  // ===== حذف پیت =====
  const handleDeletePit = (pitId: string) => {
    if (window.confirm('آیا از حذف این پیت اطمینان دارید؟')) {
      PitRepository.delete(pitId);
      setPits(pits.filter(p => p.id !== pitId));
    }
  };

  // ===== افزودن پیت =====
  const handleAddPit = () => {
    if (!mine) return;
    if (!newPitName.trim() || !newPitCode.trim()) {
      alert('نام و کد پیت الزامی است');
      return;
    }

    const pit = PitRepository.save({
      id: crypto.randomUUID(),
      mineId: mine.id,
      name: newPitName.trim(),
      code: newPitCode.trim(),
      status: newPitStatus,
      createdAt: new Date().toISOString(),
    } as Pit);

    setPits([...pits, pit]);
    setShowAddPit(false);
    setNewPitName('');
    setNewPitCode('');
    setNewPitStatus('فعال');
  };

  // ===== وضعیت بارگذاری =====
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

  // ===== رنگ‌های وضعیت =====
  const statusColors: Record<string, string> = {
    'فعال': 'text-green-400 bg-green-400/10 border-green-400/20',
    'غیرفعال': 'text-red-400 bg-red-400/10 border-red-400/20',
    'در حال بهره‌برداری': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'متوقف': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  // ===== رندر =====
  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* هدر معدن */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {mine.name}
              </h1>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[mine.status] || 'text-gray-400 border-gray-400/20 bg-gray-400/10'}`}>
                {mine.status}
              </span>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
              {mine.code} • {mine.location}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* ✅ دکمه نقشه معدن */}
            <button
              onClick={() => navigate(`/mine/${mine.id}/map`)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${
                isDark 
                  ? 'text-[#AACCDD] bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20' 
                  : 'text-[#1A2A3A] bg-[#1A2A3A]/10 hover:bg-[#1A2A3A]/20'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              نقشه معدن
            </button>
            
            {onBack && (
              <button
                onClick={onBack}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  isDark 
                    ? 'text-[#AACCDD] bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20' 
                    : 'text-[#1A2A3A] bg-[#1A2A3A]/10 hover:bg-[#1A2A3A]/20'
                }`}
              >
                ← بازگشت
              </button>
            )}
          </div>
        </div>

        {/* خلاصه آمار */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#13203A]/40 border-[#AACCDD]/10' : 'bg-white/60 border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تعداد پیت‌ها</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{pits.length}</p>
          </div>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#13203A]/40 border-[#AACCDD]/10' : 'bg-white/60 border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تاریخ ایجاد</p>
            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {new Date(mine.createdAt).toLocaleDateString('fa-IR')}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#13203A]/40 border-[#AACCDD]/10' : 'bg-white/60 border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>شناسه</p>
            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{mine.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* لیست پیت‌ها */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#13203A]/40 border-[#AACCDD]/10' : 'bg-white/60 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-[#E8EDF5]' : 'text-gray-800'}`}>
              <span className="w-1 h-4 bg-[#AACCDD] rounded-full"></span>
              پیت‌های معدن
            </h3>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{pits.length} پیت</span>
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
              <div className={`border rounded-2xl p-6 w-full max-w-md shadow-2xl ${isDark ? 'bg-[#13203A] border-[#AACCDD]/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>افزودن پیت جدید</h4>
                  <button
                    onClick={() => setShowAddPit(false)}
                    className={`transition-colors ${isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>نام پیت</label>
                    <input
                      type="text"
                      value={newPitName}
                      onChange={(e) => setNewPitName(e.target.value)}
                      placeholder="مثال: پیت شمالی"
                      className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none ${
                        isDark
                          ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                          : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>کد پیت</label>
                    <input
                      type="text"
                      value={newPitCode}
                      onChange={(e) => setNewPitCode(e.target.value)}
                      placeholder="مثال: PT-002"
                      className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none ${
                        isDark
                          ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                          : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>وضعیت</label>
                    <select
                      value={newPitStatus}
                      onChange={(e) => setNewPitStatus(e.target.value as 'فعال' | 'غیرفعال')}
                      className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none ${
                        isDark
                          ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30'
                          : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
                      }`}
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
            <div className="text-center py-8 text-[#8A9DB0]">
              <p>هیچ پیتی برای این معدن وجود ندارد.</p>
              <p className="text-sm mt-1">برای افزودن پیت، روی دکمه‌ی «افزودن پیت» کلیک کنید.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pits.map((pit) => (
                <div
                  key={pit.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isDark 
                      ? 'bg-[#AACCDD]/5 border border-[#AACCDD]/10 hover:bg-[#AACCDD]/10' 
                      : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#AACCDD]"></div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{pit.name}</p>
                      <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{pit.code}</p>
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
    </div>
  );
}