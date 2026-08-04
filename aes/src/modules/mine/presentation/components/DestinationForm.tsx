// src/modules/mine/presentation/components/DestinationForm.tsx

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ============================================
// نوع‌های داده (تعریف داخل خود فایل)
// ============================================

type DestinationType = 'CRUSHER_FEED' | 'HIGH_GRADE_STOCKPILE' | 'LOW_GRADE_STOCKPILE' | 'WASTE_DUMP' | 'TEMPORARY_STOCKPILE' | 'BLEND_STOCKPILE' | 'REJECT';
type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

const DestinationTypeLabels: Record<DestinationType, string> = {
  'CRUSHER_FEED': 'خوراک کارخانه',
  'HIGH_GRADE_STOCKPILE': 'دپوی عیار بالا',
  'LOW_GRADE_STOCKPILE': 'دپوی عیار پایین',
  'WASTE_DUMP': 'باطله',
  'TEMPORARY_STOCKPILE': 'دپوی موقت',
  'BLEND_STOCKPILE': 'دپوی اختلاط',
  'REJECT': 'رد شده',
};

interface DestinationDecision {
  id: string;
  subBlockId: string;
  destinationType: DestinationType;
  destinationId?: string;
  decisionReason: string;
  decisionBy: string;
  decisionDate: string;
  approvedBy?: string;
  approvedDate?: string;
  status: DecisionStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// سرویس‌های دیتابیس (داخل خود فایل)
// ============================================

const DESTINATION_DECISIONS_KEY = 'aes_destination_decisions';
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

function addDestinationDecision(decision: any): DestinationDecision {
  const decisions = getDestinationDecisions();
  const newDecision: DestinationDecision = {
    id: crypto.randomUUID(),
    ...decision,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  decisions.push(newDecision);
  localStorage.setItem(DESTINATION_DECISIONS_KEY, JSON.stringify(decisions));
  
  updateSubBlock(decision.subBlockId, { status: 'DESTINATION_ASSIGNED' });
  
  return newDecision;
}

function getDestinationDecisions(): DestinationDecision[] {
  try {
    const data = localStorage.getItem(DESTINATION_DECISIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ============================================
// کامپوننت اصلی
// ============================================

interface DestinationFormProps {
  subBlockId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DestinationForm({ subBlockId, onClose, onSuccess }: DestinationFormProps) {
  const [destinationType, setDestinationType] = useState<DestinationType>('CRUSHER_FEED');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionBy, setDecisionBy] = useState('');
  const [status, setStatus] = useState<DecisionStatus>('PENDING');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionReason.trim() || !decisionBy.trim()) {
      alert('لطفاً دلیل تصمیم و نام تصمیم‌گیرنده را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      addDestinationDecision({
        subBlockId,
        destinationType,
        decisionReason: decisionReason.trim(),
        decisionBy: decisionBy.trim(),
        decisionDate: new Date().toISOString(),
        status,
      });
      onSuccess();
    } catch (error) {
      alert('خطا در ثبت تصمیم مقصد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#13203A] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">تعیین مقصد</h4>
          <button
            onClick={onClose}
            className="text-[#8A9DB0] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">مقصد *</label>
            <select
              value={destinationType}
              onChange={(e) => setDestinationType(e.target.value as DestinationType)}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
            >
              {Object.entries(DestinationTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">دلیل تصمیم *</label>
            <textarea
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="چرا این مقصد انتخاب شد؟"
              rows={3}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">تصمیم‌گیرنده *</label>
            <input
              type="text"
              value={decisionBy}
              onChange={(e) => setDecisionBy(e.target.value)}
              placeholder="نام مهندس"
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              required
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">وضعیت</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DecisionStatus)}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
            >
              <option value="PENDING">در انتظار تأیید</option>
              <option value="APPROVED">تأیید شده</option>
              <option value="REJECTED">رد شده</option>
              <option value="EXECUTED">اجرا شده</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-xl hover:bg-[#8A9DB0] transition-colors disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : 'ثبت تصمیم'}
          </button>
        </form>
      </div>
    </div>
  );
}