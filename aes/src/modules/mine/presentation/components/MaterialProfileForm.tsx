// src/modules/mine/presentation/components/MaterialProfileForm.tsx

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ============================================
// نوع‌های داده (تعریف داخل خود فایل)
// ============================================

interface MaterialProfile {
  id: string;
  subBlockId: string;
  oreType: string;
  rockType: string;
  processingBehavior: string;
  gradeCategory: string;
  economicClass: string;
  mixingClass?: string;
  priority: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// سرویس‌های دیتابیس (داخل خود فایل)
// ============================================

const MATERIAL_PROFILES_KEY = 'aes_material_profiles';
const SUBBLOCKS_KEY = 'aes_subblocks';

function getSubBlocks(): any[] {
  try {
    const data = localStorage.getItem(SUBBLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function updateSubBlock(id: string, data: any): void {
  const subBlocks = getSubBlocks();
  const index = subBlocks.findIndex((sb: any) => sb.id === id);
  if (index === -1) return;
  
  subBlocks[index] = {
    ...subBlocks[index],
    ...data,
    version: (subBlocks[index].version || 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(SUBBLOCKS_KEY, JSON.stringify(subBlocks));
}

function addMaterialProfile(profile: any): MaterialProfile {
  const profiles = getMaterialProfiles();
  const newProfile: MaterialProfile = {
    id: crypto.randomUUID(),
    ...profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  profiles.push(newProfile);
  localStorage.setItem(MATERIAL_PROFILES_KEY, JSON.stringify(profiles));
  
  updateSubBlock(profile.subBlockId, { status: 'MATERIAL_CLASSIFIED' });
  
  return newProfile;
}

function getMaterialProfiles(): MaterialProfile[] {
  try {
    const data = localStorage.getItem(MATERIAL_PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ============================================
// کامپوننت اصلی
// ============================================

interface MaterialProfileFormProps {
  subBlockId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialProfileForm({ subBlockId, onClose, onSuccess }: MaterialProfileFormProps) {
  const [oreType, setOreType] = useState('');
  const [rockType, setRockType] = useState('');
  const [processingBehavior, setProcessingBehavior] = useState('');
  const [gradeCategory, setGradeCategory] = useState('MEDIUM');
  const [economicClass, setEconomicClass] = useState('');
  const [priority, setPriority] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oreType.trim() || !rockType.trim() || !processingBehavior.trim() || !economicClass.trim()) {
      alert('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }

    setLoading(true);
    try {
      addMaterialProfile({
        subBlockId,
        oreType: oreType.trim(),
        rockType: rockType.trim(),
        processingBehavior: processingBehavior.trim(),
        gradeCategory,
        economicClass: economicClass.trim(),
        priority,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      alert('خطا در ثبت طبقه‌بندی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#13203A] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">طبقه‌بندی ماده معدنی</h4>
          <button
            onClick={onClose}
            className="text-[#8A9DB0] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">نوع سنگ *</label>
            <input
              type="text"
              value={oreType}
              onChange={(e) => setOreType(e.target.value)}
              placeholder="مثال: اکسید، سولفید، ..."
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">نوع سنگ‌شناسی *</label>
            <input
              type="text"
              value={rockType}
              onChange={(e) => setRockType(e.target.value)}
              placeholder="مثال: گرانیت، آهکی، ..."
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">رفتار فرآوری *</label>
            <input
              type="text"
              value={processingBehavior}
              onChange={(e) => setProcessingBehavior(e.target.value)}
              placeholder="مثال: آسان، متوسط، سخت، ..."
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">دسته‌بندی عیار *</label>
            <select
              value={gradeCategory}
              onChange={(e) => setGradeCategory(e.target.value)}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
            >
              <option value="HIGH">عیار بالا</option>
              <option value="MEDIUM">عیار متوسط</option>
              <option value="LOW">عیار پایین</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">کلاس اقتصادی *</label>
            <input
              type="text"
              value={economicClass}
              onChange={(e) => setEconomicClass(e.target.value)}
              placeholder="مثال: کلاس A، کلاس B، ..."
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">اولویت استخراج</label>
            <select
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
            >
              <option value={1}>۱ - اولویت بالا</option>
              <option value={2}>۲</option>
              <option value={3}>۳ - متوسط</option>
              <option value={4}>۴</option>
              <option value={5}>۵ - اولویت پایین</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">یادداشت</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="یادداشت‌های تکمیلی..."
              rows={2}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-xl hover:bg-[#8A9DB0] transition-colors disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : 'ثبت طبقه‌بندی'}
          </button>
        </form>
      </div>
    </div>
  );
}