// src/modules/mine/presentation/components/SampleForm.tsx

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ============================================
// نوع‌های داده (تعریف داخل خود فایل)
// ============================================

interface Sample {
  id: string;
  subBlockId: string;
  sampleNumber: string;
  sampleDate: string;
  sampler: string;
  location?: string;
  depth?: number;
  weight?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// سرویس‌های دیتابیس (داخل خود فایل)
// ============================================

const SAMPLES_KEY = 'aes_samples';
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

function addSample(sample: any): Sample {
  const samples = getSamples();
  const newSample: Sample = {
    id: crypto.randomUUID(),
    ...sample,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  samples.push(newSample);
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));
  
  // به‌روزرسانی وضعیت SubBlock به SAMPLED
  updateSubBlock(sample.subBlockId, { status: 'SAMPLED' });
  
  return newSample;
}

function getSamples(): Sample[] {
  try {
    const data = localStorage.getItem(SAMPLES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ============================================
// کامپوننت اصلی
// ============================================

interface SampleFormProps {
  subBlockId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SampleForm({ subBlockId, onClose, onSuccess }: SampleFormProps) {
  const [sampleNumber, setSampleNumber] = useState('');
  const [sampler, setSampler] = useState('');
  const [depth, setDepth] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleNumber.trim() || !sampler.trim()) {
      alert('شماره نمونه و نام نمونه‌بردار الزامی است');
      return;
    }

    setLoading(true);
    try {
      addSample({
        subBlockId,
        sampleNumber: sampleNumber.trim(),
        sampleDate: new Date().toISOString(),
        sampler: sampler.trim(),
        depth: depth ? parseFloat(depth) : undefined,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      alert('خطا در ثبت نمونه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#13203A] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">ثبت نمونه‌برداری</h4>
          <button
            onClick={onClose}
            className="text-[#8A9DB0] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">شماره نمونه *</label>
            <input
              type="text"
              value={sampleNumber}
              onChange={(e) => setSampleNumber(e.target.value)}
              placeholder="مثال: S-001"
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">نمونه‌بردار *</label>
            <input
              type="text"
              value={sampler}
              onChange={(e) => setSampler(e.target.value)}
              placeholder="نام نمونه‌بردار"
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">عمق (متر)</label>
            <input
              type="number"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              placeholder="مثال: 15.5"
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">توضیحات</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="توضیحات نمونه..."
              rows={3}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-xl hover:bg-[#8A9DB0] transition-colors disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : 'ثبت نمونه'}
          </button>
        </form>
      </div>
    </div>
  );
}