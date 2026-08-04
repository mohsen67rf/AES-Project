// src/modules/mine/presentation/components/AssayForm.tsx

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ============================================
// نوع‌های داده
// ============================================

export interface SubBlockItem {
  id: string;
  code: string;
  assay?: number;
  isWaste?: boolean;
  wasteType?: 'سنگی' | 'آبرفتی';
}

export interface AssayFormProps {
  subBlocks: SubBlockItem[];
  onClose: () => void;
  onSuccess: (results: { subBlockId: string; assay: number; isWaste: boolean; wasteType?: string }[]) => void;
}

// ============================================
// کامپوننت اصلی
// ============================================

export function AssayForm({ subBlocks, onClose, onSuccess }: AssayFormProps) {
  const [results, setResults] = useState<SubBlockItem[]>(subBlocks);
  const [loading, setLoading] = useState(false);

  const updateAssay = (id: string, value: number) => {
    setResults(prev => prev.map(item => 
      item.id === id ? { ...item, assay: value, isWaste: false } : item
    ));
  };

  const toggleWaste = (id: string) => {
    setResults(prev => prev.map(item =>
      item.id === id ? { ...item, isWaste: !item.isWaste, assay: undefined } : item
    ));
  };

  const updateWasteType = (id: string, type: 'سنگی' | 'آبرفتی') => {
    setResults(prev => prev.map(item =>
      item.id === id ? { ...item, wasteType: type } : item
    ));
  };

  const handleSubmit = () => {
    // بررسی: همه ساب‌بلوک‌ها یا عیار دارند یا باطله هستند
    const invalid = results.some(item => 
      !item.isWaste && (item.assay === undefined || item.assay === null)
    );
    
    if (invalid) {
      alert('لطفاً برای همه ساب‌بلوک‌ها یا عیار وارد کنید یا به عنوان باطله علامت‌گذاری کنید');
      return;
    }

    // بررسی: باطله‌ها باید نوع داشته باشند
    const wasteWithoutType = results.some(item =>
      item.isWaste && !item.wasteType
    );

    if (wasteWithoutType) {
      alert('لطفاً برای ساب‌بلوک‌های باطله، نوع باطله را مشخص کنید');
      return;
    }

    setLoading(true);
    try {
      const formatted = results.map(item => ({
        subBlockId: item.id,
        assay: item.assay || 0,
        isWaste: item.isWaste || false,
        wasteType: item.wasteType,
      }));
      onSuccess(formatted);
    } catch (error) {
      alert('خطا در ثبت نتایج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#13203A] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">ثبت نتایج آنالیز آزمایشگاه</h4>
          <button
            onClick={onClose}
            className="text-[#8A9DB0] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {results.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">
                  {item.code}
                </span>
                <label className="flex items-center gap-2 text-sm text-[#8A9DB0]">
                  <input
                    type="checkbox"
                    checked={item.isWaste || false}
                    onChange={() => toggleWaste(item.id)}
                    className="w-4 h-4 rounded border-[#AACCDD]/20 bg-[#0A1628] text-[#AACCDD] focus:ring-[#AACCDD]/30"
                  />
                  باطله
                </label>
              </div>

              {item.isWaste ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => updateWasteType(item.id, 'سنگی')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      item.wasteType === 'سنگی'
                        ? 'bg-orange-500/30 text-orange-300 border border-orange-500/30'
                        : 'bg-[#0A1628] text-[#8A9DB0] border border-[#AACCDD]/10 hover:border-[#AACCDD]/30'
                    }`}
                  >
                    🪨 باطله سنگی
                  </button>
                  <button
                    onClick={() => updateWasteType(item.id, 'آبرفتی')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      item.wasteType === 'آبرفتی'
                        ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/30'
                        : 'bg-[#0A1628] text-[#8A9DB0] border border-[#AACCDD]/10 hover:border-[#AACCDD]/30'
                    }`}
                  >
                    🌊 باطله آبرفتی
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <label className="text-[#8A9DB0] text-sm">عیار (%):</label>
                  <input
                    type="number"
                    value={item.assay || ''}
                    onChange={(e) => updateAssay(item.id, parseFloat(e.target.value) || 0)}
                    placeholder="مثال: 26.5"
                    step="0.1"
                    className="w-32 px-3 py-1 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                  />
                  <span className="text-[#4A6A8A] text-xs">(عددی بین ۰ تا ۱۰۰)</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-xl hover:bg-[#8A9DB0] transition-colors disabled:opacity-50"
        >
          {loading ? 'در حال ثبت...' : 'ثبت نتایج و تعیین مقصد'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Export پیش‌فرض برای اطمینان
// ============================================

export default AssayForm;