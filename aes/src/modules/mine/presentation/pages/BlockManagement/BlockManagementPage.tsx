// src/modules/mine/presentation/pages/BlockManagement/BlockManagementPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { BlockRepository } from '../../../../../core/infrastructure/repositories';
import { BlockLifecycleService } from '../../../services/BlockLifecycleService';
import { BlockApprovalModal } from '../../components/BlockApprovalModal';
import { BlockTimeline } from '../../components/BlockTimeline';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { FullBlock, BlockLifecycleStatus } from '../../../../../core/domain/types/block.types';
import type { Block } from '../../../../../core/domain/types/mine.types';

// ============================================
// کامپوننت وضعیت بلوک
// ============================================

function BlockStatusBadge({ status }: { status: BlockLifecycleStatus }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    'DEFINED': { label: 'تعریف شده', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    'PENDING_APPROVAL': { label: 'در انتظار تأیید', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    'APPROVED': { label: 'تأیید شده', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'REJECTED': { label: 'رد شده', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    'DRILLING_PERMIT_ISSUED': { label: 'مجوز صادر شد', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'DRILLING_IN_PROGRESS': { label: 'در حال حفاری', color: 'bg-blue-500/30 text-blue-400 border-blue-500/40' },
    'DRILLING_COMPLETED': { label: 'حفاری کامل', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'SUB_BLOCKING': { label: 'در حال ساب‌بندی', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    'SUB_BLOCKED': { label: 'ساب‌بندی شد', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    'SAMPLING_COMPLETED': { label: 'نمونه کامل', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    'LAB_RESULTS_READY': { label: 'نتایج آزمایشگاه', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    'CLASSIFIED': { label: 'طبقه‌بندی شد', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'DESTINATION_SET': { label: 'مقصد تعیین شد', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'COMPLETED': { label: 'تکمیل شد', color: 'bg-green-500/30 text-green-400 border-green-500/40' },
  };

  const config = statusConfig[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

// ============================================
// کامپوننت مودال افزودن/ویرایش بلوک
// ============================================

function BlockFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  isDark,
  editingBlock = null
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  isDark: boolean;
  editingBlock?: FullBlock | null;
}) {
  const [code, setCode] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [totalHoles, setTotalHoles] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const isEditing = !!editingBlock;

  // ============================================
  // پر کردن فرم با داده‌های بلوک در حالت ویرایش
  // ============================================

  useEffect(() => {
    if (editingBlock) {
      setCode(editingBlock.code);
      setTargetLevel(String(editingBlock.targetLevel));
      setBlockNumber(String(editingBlock.blockNumber));
      setTotalHoles(String(editingBlock.drillingParams?.totalHoles || ''));
    } else {
      setCode('');
      setTargetLevel('');
      setBlockNumber('');
      setTotalHoles('');
    }
    setCodeError('');
  }, [editingBlock, isOpen]);

  const validateCode = (value: string) => {
    const englishPattern = /^[a-zA-Z0-9\s\-]*$/;
    if (!englishPattern.test(value)) {
      setCodeError('❌ فقط حروف انگلیسی، اعداد، فاصله و خط تیره مجاز است');
      return false;
    }
    setCodeError('');
    return true;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCode(value);
    validateCode(value);
  };

  const handleSubmit = async () => {
    if (!code.trim() || !targetLevel.trim() || !blockNumber.trim()) {
      alert('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }

    if (!validateCode(code)) {
      return;
    }

    setLoading(true);
    try {
      const blockData = {
        code: code.trim(),
        name: code.trim(),
        targetLevel: parseInt(targetLevel),
        blockNumber: parseInt(blockNumber),
        drillingParams: {
          totalHoles: parseInt(totalHoles) || 0,
          holeDiameter: 76,
          avgDesignDepth: 12.5,
          pattern: 'شبکه ۳×۳',
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [],
          drillingPoints: [],
        },
        createdBy: 'current_user',
      };

      let result;
      if (isEditing && editingBlock) {
        // ✅ ویرایش بلوک
        const updatedBlock: Block = {
          ...editingBlock,
          code: blockData.code,
          name: blockData.name,
          targetLevel: blockData.targetLevel,
          blockNumber: blockData.blockNumber,
          drillingParams: blockData.drillingParams,
          updatedAt: new Date().toISOString(),
        };
        BlockRepository.save(updatedBlock);
        result = updatedBlock;
      } else {
        // ✅ ایجاد بلوک جدید
        result = BlockLifecycleService.defineBlock(blockData);
      }

      if (result) {
        onSuccess();
        onClose();
        setCode('');
        setTargetLevel('');
        setBlockNumber('');
        setTotalHoles('');
        setCodeError('');
      }
    } catch (error) {
      console.error('❌ خطا در ذخیره بلوک:', error);
      alert('خطا در ذخیره بلوک');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${
            isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200/50'
          }`}>
            
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-[#C9A227]/20' : 'bg-[#C9A227]/10'
                }`}>
                  <DocumentTextIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {isEditing ? '✏️ ویرایش بلوک' : '📋 بلوک جدید'}
                  </h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    {isEditing ? 'ویرایش اطلاعات بلوک' : 'تعریف بلوک جدید توسط دفتر فنی پیمانکار'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                  کد بلوک *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="مثال: 1040 B 60"
                  dir="ltr"
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none text-left ${
                    isDark 
                      ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                      : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
                  } ${codeError ? 'border-red-500 focus:border-red-500' : ''}`}
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
                {codeError && (
                  <p className="text-red-400 text-xs mt-1">{codeError}</p>
                )}
                <p className={`text-[9px] mt-1 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                  💡 فقط حروف انگلیسی، اعداد، فاصله و خط تیره
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                    تراز هدف *
                  </label>
                  <input
                    type="number"
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    placeholder="مثال: 1040"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                      isDark 
                        ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                        : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                    شماره بلوک *
                  </label>
                  <input
                    type="number"
                    value={blockNumber}
                    onChange={(e) => setBlockNumber(e.target.value)}
                    placeholder="مثال: 60"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                      isDark 
                        ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                        : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                  تعداد چال‌ها
                </label>
                <input
                  type="number"
                  value={totalHoles}
                  onChange={(e) => setTotalHoles(e.target.value)}
                  placeholder="مثال: 36"
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                    isDark 
                      ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                      : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
                  }`}
                />
              </div>

              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-[#13203A]/40' : 'bg-gray-100'}`}>
                <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  کد بلوک: 
                  <span 
                    className={`font-mono font-bold mr-1 ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}
                    style={{ direction: 'ltr', display: 'inline-block' }}
                  >
                    {code || '___ B ___'}
                  </span>
                </p>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                انصراف
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !!codeError}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'در حال ذخیره...' : (isEditing ? 'ویرایش بلوک' : 'ایجاد بلوک')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// کامپوننت مودال جزئیات بلوک
// ============================================

function BlockDetailModal({ 
  blockId, 
  isOpen, 
  onClose, 
  onRefresh,
  isDark,
  onEdit
}: { 
  blockId: string; 
  isOpen: boolean; 
  onClose: () => void; 
  onRefresh: () => void;
  isDark: boolean;
  onEdit: (block: FullBlock) => void;
}) {
  const [block, setBlock] = useState<FullBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'approval'>('info');

  useEffect(() => {
    if (isOpen && blockId) {
      loadData();
    }
  }, [isOpen, blockId]);

  const loadData = () => {
    setLoading(true);
    const fullBlock = BlockLifecycleService.getFullBlock(blockId);
    setBlock(fullBlock);
    setLoading(false);
  };

  const handleApprove = (notes?: string) => {
    const approval = BlockLifecycleService.approveBlock(blockId, 'current_user', 'کاربر جاری');
    if (approval) {
      loadData();
      onRefresh();
      setShowApprovalModal(false);
    }
  };

  const handleReject = (reason: string, notes: string, geoData?: any) => {
    const approval = BlockLifecycleService.rejectBlock(blockId, 'current_user', 'کاربر جاری', reason, notes, geoData);
    if (approval) {
      loadData();
      onRefresh();
      setShowApprovalModal(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`آیا از حذف بلوک ${block?.code} اطمینان دارید؟`)) {
      BlockRepository.delete(blockId);
      onRefresh();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-4xl max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${
            isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200/50'
          }`}>
            
            <div className={`px-6 py-4 border-b flex items-center justify-between flex-shrink-0 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-[#C9A227]/20' : 'bg-[#C9A227]/10'
                }`}>
                  <DocumentTextIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {block?.code || 'جزئیات بلوک'}
                  </h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    {block && <BlockStatusBadge status={block.lifecycleStatus} />}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* ✅ دکمه ویرایش */}
                {block && block.lifecycleStatus !== 'COMPLETED' && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(block);
                    }}
                    className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                      isDark ? 'hover:bg-yellow-500/20 text-yellow-400' : 'hover:bg-yellow-100 text-yellow-600'
                    }`}
                    title="ویرایش بلوک"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
                {/* ✅ دکمه حذف */}
                {block && block.lifecycleStatus !== 'COMPLETED' && (
                  <button
                    onClick={handleDelete}
                    className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                      isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
                    }`}
                    title="حذف بلوک"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                  isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
                }`}>
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className={`px-6 pt-4 border-b flex gap-2 flex-shrink-0 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'info'
                    ? isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#C9A227]/20 text-[#C9A227]'
                    : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                📋 اطلاعات
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'timeline'
                    ? isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#C9A227]/20 text-[#C9A227]'
                    : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                ⏱️ تاریخچه
              </button>
              <button
                onClick={() => setActiveTab('approval')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'approval'
                    ? isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#C9A227]/20 text-[#C9A227]'
                    : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                ✅ تأیید
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32 text-[#8A9DB0]">
                  در حال بارگذاری...
                </div>
              ) : !block ? (
                <div className="text-center text-red-400">بلوک یافت نشد</div>
              ) : (
                <>
                  {activeTab === 'info' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>کد بلوک</p>
                          <p 
                            className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
                            style={{ direction: 'ltr', textAlign: 'left' }}
                          >
                            {block.code}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تراز هدف</p>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{block.targetLevel}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>شماره بلوک</p>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{block.blockNumber}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تعداد چال‌ها</p>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{block.drillingParams?.totalHoles || 0}</p>
                        </div>
                      </div>

                      {block.rejectionData && (
                        <div className={`p-4 rounded-xl border-red-500/20 bg-red-500/10`}>
                          <p className={`text-sm font-medium text-red-400`}>دلیل رد: {block.rejectionData.reason}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                            {block.rejectionData.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <BlockTimeline block={block} />
                  )}

                  {activeTab === 'approval' && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl ${
                        isDark ? 'bg-[#13203A]/40' : 'bg-gray-50'
                      }`}>
                        <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                          وضعیت فعلی: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            <BlockStatusBadge status={block.lifecycleStatus} />
                          </span>
                        </p>
                      </div>

                      {block.lifecycleStatus === 'PENDING_APPROVAL' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowApprovalModal(true)}
                            className="flex-1 px-4 py-2 bg-[#C9A227] text-[#1A2A3A] rounded-xl hover:bg-[#D4AF37] transition-colors"
                          >
                            بررسی بلوک
                          </button>
                        </div>
                      )}

                      {block.lifecycleStatus === 'REJECTED' && (
                        <div className={`p-4 rounded-xl border-red-500/20 bg-red-500/10`}>
                          <p className="text-sm text-red-400">این بلوک رد شده است. برای اصلاح به پیمانکار برگشت داده شد.</p>
                        </div>
                      )}

                      {block.drillingPermit && (
                        <div className={`p-4 rounded-xl ${
                          isDark ? 'bg-[#13203A]/40 border border-[#AACCDD]/10' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            📄 مجوز حفاری
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>شماره مجوز</p>
                              <p className={`text-sm font-medium ${isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]'}`}>
                                {block.drillingPermit.permitNumber}
                              </p>
                            </div>
                            <div>
                              <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>تاریخ صدور</p>
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {new Date(block.drillingPermit.issuedAt).toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex justify-end flex-shrink-0 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>

      <BlockApprovalModal
        isOpen={showApprovalModal}
        blockCode={block?.code || ''}
        blockData={block}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setShowApprovalModal(false)}
        isDark={isDark}
      />
    </>
  );
}

// ============================================
// صفحه اصلی مدیریت بلوک‌ها
// ============================================

export function BlockManagementPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  const [blocks, setBlocks] = useState<FullBlock[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<FullBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<FullBlock | null>(null);

  // ============================================
  // بارگذاری داده
  // ============================================

  const loadData = () => {
    setLoading(true);
    const allBlocks = BlockRepository.getAll();
    const fullBlocks = allBlocks.map(block => {
      const full = BlockLifecycleService.getFullBlock(block.id);
      return full!;
    }).filter(b => b !== null);
    setBlocks(fullBlocks);
    setFilteredBlocks(fullBlocks);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // فیلتر
  // ============================================

  useEffect(() => {
    let filtered = blocks;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(b => 
        b.code.toLowerCase().includes(q) ||
        String(b.targetLevel).includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(b => b.lifecycleStatus === statusFilter);
    }

    setFilteredBlocks(filtered);
  }, [searchQuery, statusFilter, blocks]);

  // ============================================
  // آمار
  // ============================================

  const stats = {
    total: blocks.length,
    pending: blocks.filter(b => b.lifecycleStatus === 'PENDING_APPROVAL').length,
    approved: blocks.filter(b => b.lifecycleStatus === 'APPROVED' || b.lifecycleStatus === 'DRILLING_PERMIT_ISSUED').length,
    rejected: blocks.filter(b => b.lifecycleStatus === 'REJECTED').length,
    completed: blocks.filter(b => b.lifecycleStatus === 'COMPLETED').length,
    drilling: blocks.filter(b => 
      b.lifecycleStatus === 'DRILLING_IN_PROGRESS' || 
      b.lifecycleStatus === 'DRILLING_COMPLETED'
    ).length,
  };

  // ============================================
  // ستون‌های جدول با دکمه‌های ویرایش و حذف
  // ============================================

  const columns = [
    {
      key: 'code',
      header: 'کد بلوک',
      render: (item: FullBlock) => (
        <div>
          <p 
            className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
            style={{ direction: 'ltr', textAlign: 'left' }}
          >
            {item.code}
          </p>
          <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
            تراز: {item.targetLevel} • شماره: {item.blockNumber}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (item: FullBlock) => (
        <BlockStatusBadge status={item.lifecycleStatus} />
      ),
    },
    {
      key: 'drillingParams',
      header: 'پارامترهای حفاری',
      render: (item: FullBlock) => (
        <div className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
          <p>چال‌ها: {item.drillingParams?.totalHoles || 0}</p>
          <p>قطر: {item.drillingParams?.holeDiameter || 0}mm</p>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'آخرین تغییر',
      render: (item: FullBlock) => (
        <span className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
          {new Date(item.updatedAt).toLocaleDateString('fa-IR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (item: FullBlock) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedBlockId(item.id);
              setShowDetailModal(true);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
            }`}
            title="جزئیات"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          
          {/* ✅ دکمه ویرایش */}
          {item.lifecycleStatus !== 'COMPLETED' && (
            <button
              onClick={() => {
                setEditingBlock(item);
                setShowAddModal(true);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-yellow-500/20 text-yellow-400' : 'hover:bg-yellow-100 text-yellow-600'
              }`}
              title="ویرایش بلوک"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          
          {/* ✅ دکمه حذف */}
          {item.lifecycleStatus !== 'COMPLETED' && (
            <button
              onClick={() => {
                if (window.confirm(`آیا از حذف بلوک ${item.code} اطمینان دارید؟`)) {
                  BlockRepository.delete(item.id);
                  loadData();
                }
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
              }`}
              title="حذف بلوک"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ============================================
  // رندر
  // ============================================

  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* هدر */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              🏗️ مدیریت بلوک‌ها
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
              مدیریت چرخه‌ی کامل بلوک‌ها از تعریف تا صدور مجوز
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBlock(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#C9A227] text-[#1A2A3A] rounded-xl hover:bg-[#D4AF37] transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            بلوک جدید
          </button>
        </div>

        {/* آمار */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className={`p-3 rounded-xl text-center ${
            isDark ? 'bg-[#13203A]/40 border border-[#AACCDD]/10' : 'bg-white/70 border border-gray-200'
          }`}>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
            <p className={`text-[10px] ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>کل بلوک‌ها</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${
            isDark ? 'bg-[#13203A]/40 border border-[#AACCDD]/10' : 'bg-white/70 border border-gray-200'
          }`}>
            <p className={`text-2xl font-bold text-yellow-400`}>{stats.pending}</p>
            <p className={`text-[10px] ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>در انتظار تأیید</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${
            isDark ? 'bg-[#13203A]/40 border border-[#AACCDD]/10' : 'bg-white/70 border border-gray-200'
          }`}>
            <p className={`text-2xl font-bold text-green-400`}>{stats.approved}</p>
            <p className={`text-[10px] ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تأیید شده</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${
            isDark ? 'bg-[#13203A]/40 border border-[#AACCDD]/10' : 'bg-white/70 border border-gray-200'
          }`}>
            <p className={`text-2xl font-bold text-red-400`}>{stats.rejected}</p>
            <p className={`text-[10px] ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>رد شده</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${
            isDark ? 'bg-[#13203A]/40 border border-[#AACCDD]/10' : 'bg-white/70 border border-gray-200'
          }`}>
            <p className={`text-2xl font-bold text-blue-400`}>{stats.drilling}</p>
            <p className={`text-[10px] ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>در حال حفاری</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${
            isDark ? 'bg-[#13203A]/40 border border-[#AACCDD]/10' : 'bg-white/70 border border-gray-200'
          }`}>
            <p className={`text-2xl font-bold text-green-400`}>{stats.completed}</p>
            <p className={`text-[10px] ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تکمیل شده</p>
          </div>
        </div>

        {/* فیلترها */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <MagnifyingGlassIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی بلوک..."
              className={`w-full pr-10 pl-4 py-2 rounded-xl border focus:outline-none text-sm ${
                isDark 
                  ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                  : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
              }`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-xl border focus:outline-none text-sm ${
              isDark 
                ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#00D4FF]/50' 
                : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#C9A227]/50'
            }`}
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="DEFINED">تعریف شده</option>
            <option value="PENDING_APPROVAL">در انتظار تأیید</option>
            <option value="APPROVED">تأیید شده</option>
            <option value="REJECTED">رد شده</option>
            <option value="DRILLING_PERMIT_ISSUED">مجوز صادر شد</option>
            <option value="DRILLING_IN_PROGRESS">در حال حفاری</option>
            <option value="DRILLING_COMPLETED">حفاری کامل</option>
            <option value="SUB_BLOCKED">ساب‌بندی شد</option>
            <option value="SAMPLING_COMPLETED">نمونه کامل</option>
            <option value="LAB_RESULTS_READY">نتایج آزمایشگاه</option>
            <option value="CLASSIFIED">طبقه‌بندی شد</option>
            <option value="DESTINATION_SET">مقصد تعیین شد</option>
            <option value="COMPLETED">تکمیل شد</option>
          </select>

          <button
            onClick={loadData}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>

        {/* جدول */}
        <div className={`rounded-2xl overflow-hidden border ${
          isDark ? 'bg-[#13203A]/40 border-[#AACCDD]/10' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className={`border-b ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
                  {columns.map((col) => (
                    <th key={col.key} className={`px-4 py-3 text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className={`text-center py-8 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className={`text-center py-8 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                      هیچ بلوکی یافت نشد
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((item) => (
                    <tr key={item.id} className={`border-b ${isDark ? 'border-[#AACCDD]/5' : 'border-gray-100'} hover:bg-white/5 transition-colors`}>
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          {col.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* تعداد نتایج */}
        <div className={`text-sm text-left ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
          نمایش {filteredBlocks.length} از {blocks.length} بلوک
        </div>
      </div>

      {/* مودال افزودن/ویرایش بلوک */}
      <BlockFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBlock(null);
        }}
        onSuccess={loadData}
        isDark={isDark}
        editingBlock={editingBlock}
      />

      {/* مودال جزئیات بلوک */}
      {selectedBlockId && (
        <BlockDetailModal
          blockId={selectedBlockId}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBlockId(null);
          }}
          onRefresh={loadData}
          isDark={isDark}
          onEdit={(block) => {
            setEditingBlock(block);
            setShowAddModal(true);
          }}
        />
      )}
    </div>
  );
}

export default BlockManagementPage;