// src/modules/mine/presentation/pages/SubBlockDetailPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SubBlockTimeline } from '../components/SubBlockTimeline/SubBlockTimeline';
import { SubBlockRepository } from '../../../../core/infrastructure/repositories';
import { SubBlockLifecycleService } from '../../services/SubBlockLifecycleService';
import { SUB_BLOCK_STATUS_LABELS, SUB_BLOCK_STATUS_COLORS } from '../../../../core/domain/constants/subblock.constants';
import { 
  ArrowLeftIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  BeakerIcon,
  MapPinIcon,
  TruckIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { SubBlock, SubBlockStatus } from '../../../../core/domain/types/mine.types';

export function SubBlockDetailPage() {
  const { subBlockId } = useParams<{ subBlockId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [subBlock, setSubBlock] = useState<SubBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'info' | 'lab' | 'processing'>('timeline');

  useEffect(() => {
    if (subBlockId) {
      loadData();
    }
  }, [subBlockId]);

  const loadData = () => {
    setLoading(true);
    const data = SubBlockRepository.getById(subBlockId || '');
    setSubBlock(data);
    setLoading(false);
  };

  const handleStatusClick = (status: SubBlockStatus) => {
    console.log('📋 کلیک روی وضعیت:', status);
    // می‌توانیم یک مودال برای تغییر وضعیت باز کنیم
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[#8A9DB0]">
        در حال بارگذاری...
      </div>
    );
  }

  if (!subBlock) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        ساب‌بلوک یافت نشد!
      </div>
    );
  }

  const progress = SubBlockLifecycleService.getProgress(subBlock);
  const statusColor = SUB_BLOCK_STATUS_COLORS[subBlock.status] || '';

  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* هدر */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {subBlock.code}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                  {SUB_BLOCK_STATUS_LABELS[subBlock.status] || subBlock.status}
                </span>
                <span className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  پیشرفت: {progress.percentComplete}%
                </span>
                <span className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  فاز {progress.phaseIndex} از {progress.totalPhases}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={loadData}
            className={`p-2 rounded-xl transition-colors ${
              isDark 
                ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* نوار پیشرفت */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#13203A]/40' : 'bg-white/70'} border ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
              چرخه‌ی زندگی ساب‌بلوک
            </span>
            <span className={`text-sm font-semibold ${isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]'}`}>
              {progress.percentComplete}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-gray-700/30">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${progress.percentComplete}%`,
                background: `linear-gradient(90deg, #00D4FF, #C9A227)`
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {['تعریف', 'نمونه', 'آزمایشگاه', 'طبقه‌بندی', 'تصمیم', 'اجرا', 'فرآوری', 'نهایی'].map((label, index) => (
              <span 
                key={index}
                className={`text-[8px] ${
                  index < progress.phaseIndex 
                    ? 'text-green-400' 
                    : index === progress.phaseIndex - 1 
                      ? 'text-[#00D4FF]' 
                      : 'text-gray-600'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* تب‌ها */}
        <div className={`flex gap-2 border-b ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'} pb-2`}>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
              activeTab === 'timeline'
                ? isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#C9A227]/20 text-[#C9A227]'
                : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            تایم‌لاین
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
              activeTab === 'info'
                ? isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#C9A227]/20 text-[#C9A227]'
                : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <DocumentTextIcon className="w-4 h-4" />
            اطلاعات
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
              activeTab === 'lab'
                ? isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#C9A227]/20 text-[#C9A227]'
                : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <BeakerIcon className="w-4 h-4" />
            آزمایشگاه
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
              activeTab === 'processing'
                ? isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#C9A227]/20 text-[#C9A227]'
                : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            فرآوری
          </button>
        </div>

        {/* محتوای تب‌ها */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-[#13203A]/40' : 'bg-white/70'} border ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
          {activeTab === 'timeline' && (
            <SubBlockTimeline 
              subBlock={subBlock} 
              onStatusClick={handleStatusClick}
            />
          )}
          
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                اطلاعات پایه
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>کد</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.code}</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>بلوک</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.blockId}</p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تاریخ ایجاد</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {new Date(subBlock.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>نسخه</p>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.version || 1}</p>
                </div>
              </div>
              
              {subBlock.destination && (
                <div className="mt-4 p-4 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/20">
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]'}`}>
                    مقصد نهایی
                  </h4>
                  <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.destination}</p>
                  {subBlock.destinationReason && (
                    <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                      دلیل: {subBlock.destinationReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lab' && subBlock.labResults && (
            <div className="space-y-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                نتایج آزمایشگاه
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(subBlock.labResults).map(([key, value]) => (
                  <div key={key} className={`p-3 rounded-xl ${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                      {key.toUpperCase()}
                    </p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-[#C9A227]/5 border border-[#C9A227]/20">
                <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  عیار کل: <span className={`font-bold ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`}>
                    {subBlock.labResults.assay}%
                  </span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'processing' && (
            <div className="space-y-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                اطلاعات فرآوری
              </h3>
              {subBlock.processingStages && subBlock.processingStages.length > 0 ? (
                <div className="space-y-3">
                  {subBlock.processingStages.map((stage, index) => (
                    <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} border ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {stage.name}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          stage.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          stage.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {stage.status}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                        شروع: {new Date(stage.startDate).toLocaleDateString('fa-IR')}
                        {stage.endDate && ` - پایان: ${new Date(stage.endDate).toLocaleDateString('fa-IR')}`}
                      </p>
                      {stage.notes && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                          {stage.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  اطلاعات فرآوری ثبت نشده است
                </p>
              )}

              {subBlock.finalProduct && (
                <div className="mt-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <h4 className={`text-sm font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    محصول نهایی
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>نام محصول</p>
                      <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.finalProduct.productName}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>عیار</p>
                      <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.finalProduct.grade}%</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>مقدار</p>
                      <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.finalProduct.quantity} {subBlock.finalProduct.unit}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>کیفیت</p>
                      <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{subBlock.finalProduct.quality}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}