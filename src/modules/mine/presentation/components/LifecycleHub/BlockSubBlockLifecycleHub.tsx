// src/modules/mine/presentation/components/LifecycleHub/BlockSubBlockLifecycleHub.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  DocumentPlusIcon,
  BeakerIcon,
  TagIcon,
  TruckIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  BlockRepository, 
  SubBlockRepository,
  DrillingPointRepository
} from '../../../../../core/infrastructure/repositories';
import type { Block, SubBlock, DestinationType } from '../../../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';
import { SubBlocksTable } from '../SubBlocksTable/SubBlocksTable';
import { SamplingModal } from '../LifecycleModals/SamplingModal';
import { LabResultsModal } from '../LifecycleModals/LabResultsModal';
import { ClassificationModal } from '../LifecycleModals/ClassificationModal';
import { DestinationModal } from '../LifecycleModals/DestinationModal';
import { CrusherConsumptionModal } from '../LifecycleModals/CrusherConsumptionModal';
import { SubBlockDetailModal } from '../LifecycleModals/SubBlockDetailModal';
import { DESTINATION_LABELS } from '../../../../../core/domain/constants/mine.constants';

interface BlockSubBlockLifecycleHubProps {
  initialBlockId?: string;
  onBlockSelect?: (block: Block) => void;
}

export function BlockSubBlockLifecycleHub({ initialBlockId, onBlockSelect }: BlockSubBlockLifecycleHubProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(initialBlockId || '');
  const [subBlocks, setSubBlocks] = useState<SubBlock[]>([]);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // مودال‌ها
  const [activeSubBlock, setActiveSubBlock] = useState<SubBlock | null>(null);
  const [activeModal, setActiveModal] = useState<'sample' | 'lab' | 'classify' | 'destination' | 'crush' | 'detail' | 'createSubBlocks' | null>(null);

  // فرم ایجاد ساب‌بلوک
  const [newSubBlockCount, setNewSubBlockCount] = useState<number>(4);
  const [newTotalTonnage, setNewTotalTonnage] = useState<number>(16000);

  // بارگذاری داده‌ها
  const loadData = () => {
    const allBlocks = BlockRepository.getAll();
    setBlocks(allBlocks);

    let currentBlockId = selectedBlockId;
    if (!currentBlockId && allBlocks.length > 0) {
      currentBlockId = allBlocks[0].id;
      setSelectedBlockId(currentBlockId);
    }

    if (currentBlockId) {
      const sbs = SubBlockRepository.findBy('blockId', currentBlockId);
      setSubBlocks(sbs);
    } else {
      setSubBlocks([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBlockId]);

  const selectedBlock = useMemo(() => {
    return blocks.find(b => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  // فیلتر کردن ساب‌بلوک‌ها
  const filteredSubBlocks = useMemo(() => {
    return subBlocks.filter(sb => {
      // جستجو
      if (searchTerm && !sb.code.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // فیلتر مرحله
      if (activeStageFilter === 'ALL') return true;
      if (activeStageFilter === 'SAMPLING' && (sb.status === 'DEFINED' || sb.status === 'SUB_BLOCKED' || sb.status === 'SAMPLING_REQUESTED')) return true;
      if (activeStageFilter === 'LAB' && (sb.status === 'SAMPLING_COMPLETED' || sb.status === 'LAB_SENT' || sb.status === 'LAB_IN_PROGRESS')) return true;
      if (activeStageFilter === 'CLASSIFY' && (sb.status === 'LAB_COMPLETED' || sb.status === 'CLASSIFICATION_PENDING')) return true;
      if (activeStageFilter === 'DESTINATION' && (sb.status === 'CLASSIFICATION_DONE' || sb.status === 'DESTINATION_PENDING')) return true;
      if (activeStageFilter === 'CRUSHING' && (sb.status === 'DESTINATION_APPROVED' || sb.status === 'DELIVERED' || sb.status === 'PROCESSING')) return true;
      if (activeStageFilter === 'COMPLETED' && (sb.status === 'FINAL_PRODUCT' || sb.status === 'COMPLETED' || sb.status === 'SOLD')) return true;
      return false;
    });
  }, [subBlocks, activeStageFilter, searchTerm]);

  // آمار و ارقام کلیدی
  const metrics = useMemo(() => {
    const totalTonnage = subBlocks.reduce((sum, sb) => sum + (sb.tonnage || sb.estimatedTonnage || 0), 0);
    const sampledCount = subBlocks.filter(sb => !!sb.sampleId).length;
    const assayed = subBlocks.filter(sb => sb.labResults?.fe !== undefined);
    const avgFe = assayed.length > 0
      ? assayed.reduce((sum, sb) => sum + (sb.labResults?.fe || 0), 0) / assayed.length
      : 0;

    const highGradeCount = subBlocks.filter(sb => sb.gradeCategory === 'HIGH' || (sb.labResults?.fe || 0) >= 58).length;
    const mediumGradeCount = subBlocks.filter(sb => sb.gradeCategory === 'MEDIUM' || ((sb.labResults?.fe || 0) >= 48 && (sb.labResults?.fe || 0) < 58)).length;
    const lowGradeCount = subBlocks.filter(sb => sb.gradeCategory === 'LOW' || ((sb.labResults?.fe || 0) >= 35 && (sb.labResults?.fe || 0) < 48)).length;
    const wasteCount = subBlocks.filter(sb => sb.isWaste || sb.gradeCategory === 'WASTE' || (sb.labResults?.fe !== undefined && (sb.labResults?.fe || 0) < 35)).length;

    const totalCrushedTonnage = subBlocks.reduce((sum, sb) => sum + (sb.crusherFeedData?.feedTonnage || 0), 0);
    const totalLumpProduced = subBlocks.reduce((sum, sb) => sum + (sb.crusherFeedData?.productLumpTonnage || 0), 0);
    const totalFinesProduced = subBlocks.reduce((sum, sb) => sum + (sb.crusherFeedData?.productFinesTonnage || 0), 0);

    return {
      totalSubBlocks: subBlocks.length,
      totalTonnage,
      sampledCount,
      assayedCount: assayed.length,
      avgFe: avgFe.toFixed(2),
      highGradeCount,
      mediumGradeCount,
      lowGradeCount,
      wasteCount,
      totalCrushedTonnage,
      totalLumpProduced,
      totalFinesProduced,
    };
  }, [subBlocks]);

  // ایجاد سریع ساب‌بلوک‌ها
  const handleCreateSubBlocks = () => {
    if (!selectedBlock) return;
    SubBlockLifecycleService.createSubBlocksForBlock(
      selectedBlock.id,
      newSubBlockCount,
      selectedBlock.code,
      selectedBlock.targetLevel,
      newTotalTonnage,
      'مهندس معدن'
    );
    loadData();
    setActiveModal(null);
  };

  // باز کردن مودال عملیات
  const handleActionClick = (sb: SubBlock, actionType: 'sample' | 'lab' | 'classify' | 'destination' | 'crush' | 'view') => {
    setActiveSubBlock(sb);
    if (actionType === 'view') {
      setActiveModal('detail');
    } else {
      setActiveModal(actionType);
    }
  };

  // به‌روزرسانی موفق در مودال‌ها
  const handleModalSuccess = (updatedSubBlock: SubBlock) => {
    loadData();
    setActiveSubBlock(updatedSubBlock);
  };

  // طبقه‌بندی خودکار همه ساب‌بلوک‌ها
  const handleAutoClassifyAll = () => {
    subBlocks.forEach(sb => {
      if (sb.labResults?.fe !== undefined && sb.status === 'LAB_COMPLETED') {
        SubBlockLifecycleService.autoClassifySubBlock(sb.id, 'موتور هوشمند طبقه‌بندی');
      }
    });
    loadData();
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* هدر چرخه و انتخاب بلوک */}
      <div className="p-6 rounded-3xl bg-gradient-to-l from-[#0A1628] via-[#0E2038] to-[#122A4A] border border-white/10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-[#00D4FF]/20 text-[#00D4FF]">
                <SparklesIcon className="w-6 h-6" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                چرخه‌ی هوشمند مدیریت بلوک‌ها و ساب‌بلوک‌ها
              </h2>
            </div>
            <p className="text-sm text-[#8A9DB0]">
              از تعریف بلوک و تفکیک زون‌ها تا نمونه‌برداری پودری، آنالیز آزمایشگاهی، طبقه‌بندی ژئومتالورژی، تعیین مقصد و مصرف در خطوط خردایش
            </p>
          </div>

          {/* انتخابگر بلوک */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-[#8A9DB0] mb-1 font-semibold">انتخاب بلوک معدنی</label>
              <select
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                className="px-4 py-2.5 bg-[#0A1628] border border-white/20 rounded-2xl text-white font-bold font-mono text-sm focus:outline-none focus:border-[#00D4FF] cursor-pointer min-w-[200px]"
              >
                {blocks.map(b => (
                  <option key={b.id} value={b.id}>
                    بلوک {b.code} (تراز {b.targetLevel})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveModal('createSubBlocks')}
              className="mt-5 px-4 py-2.5 bg-[#00D4FF] hover:bg-[#00B4D8] text-[#0A1628] font-bold rounded-2xl text-sm transition-all shadow-lg shadow-[#00D4FF]/20 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span>تفکیک ساب‌بلوک جدید</span>
            </button>

            <button
              onClick={loadData}
              title="بارگذاری مجدد"
              className="mt-5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* کارت مشخصات بلوک انتخاب شده */}
        {selectedBlock && (
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[#8A9DB0] block mb-1">کد و شناسه بلوک</span>
              <span className="text-white font-mono font-bold text-sm">{selectedBlock.code}</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[#8A9DB0] block mb-1">تراز پله معدن</span>
              <span className="text-white font-bold text-sm font-mono">{selectedBlock.targetLevel} m</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[#8A9DB0] block mb-1">تعداد چال‌های طراحی</span>
              <span className="text-white font-bold text-sm font-mono">{selectedBlock.drillingParams?.totalHoles || 0} چال</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[#8A9DB0] block mb-1">تعداد ساب‌بلوک‌ها</span>
              <span className="text-[#00D4FF] font-bold text-sm font-mono">{metrics.totalSubBlocks} عدد</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[#8A9DB0] block mb-1">مجموع تناژ استخراجی</span>
              <span className="text-white font-bold text-sm font-mono">{metrics.totalTonnage.toLocaleString()} تن</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[#8A9DB0] block mb-1">میانگین عیار آهن کانسار</span>
              <span className={`font-mono font-bold text-sm ${parseFloat(metrics.avgFe) >= 55 ? 'text-green-400' : 'text-yellow-400'}`}>
                {parseFloat(metrics.avgFe) > 0 ? `${metrics.avgFe}% Fe` : 'در انتظار آنالیز'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* خط لوله پیشرفت چرخه (Lifecycle Pipeline Tracker) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* فاز ۱: تعریف */}
        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'SAMPLING' ? 'ALL' : 'SAMPLING')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            activeStageFilter === 'SAMPLING' ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-yellow-400">۱. نمونه‌برداری</span>
            <DocumentPlusIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{metrics.sampledCount} <span className="text-xs text-[#8A9DB0]">از {metrics.totalSubBlocks}</span></p>
          <p className="text-[11px] text-[#8A9DB0] mt-1">چال‌پاشی و پودری</p>
        </button>

        {/* فاز ۲: آزمایشگاه */}
        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'LAB' ? 'ALL' : 'LAB')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            activeStageFilter === 'LAB' ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-400">۲. آنالیز آزمایشگاه</span>
            <BeakerIcon className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{metrics.assayedCount} <span className="text-xs text-[#8A9DB0]">آنالیز شده</span></p>
          <p className="text-[11px] text-[#8A9DB0] mt-1">XRF و تیتراسیون Fe</p>
        </button>

        {/* فاز ۳: طبقه‌بندی کانسار */}
        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'CLASSIFY' ? 'ALL' : 'CLASSIFY')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            activeStageFilter === 'CLASSIFY' ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400">۳. طبقه‌بندی کانسار</span>
            <TagIcon className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {metrics.highGradeCount + metrics.mediumGradeCount} <span className="text-xs text-green-400 font-normal">کانسنگ</span>
          </p>
          <p className="text-[11px] text-[#8A9DB0] mt-1">{metrics.wasteCount} باطله معدنی</p>
        </button>

        {/* فاز ۴: تعیین مقصد */}
        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'DESTINATION' ? 'ALL' : 'DESTINATION')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            activeStageFilter === 'DESTINATION' ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400">۴. دیسپاچینگ و مقصد</span>
            <TruckIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {subBlocks.filter(sb => !!sb.destination).length} <span className="text-xs text-[#8A9DB0]">مجوز حمل</span>
          </p>
          <p className="text-[11px] text-[#8A9DB0] mt-1">تخصیص خطوط و دپوها</p>
        </button>

        {/* فاز ۵: خطوط خردایش */}
        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'CRUSHING' ? 'ALL' : 'CRUSHING')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            activeStageFilter === 'CRUSHING' ? 'bg-pink-500/20 border-pink-500 shadow-lg shadow-pink-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-400">۵. مصرف خط خردایش</span>
            <Cog6ToothIcon className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-xl font-bold font-mono text-white truncate">
            {metrics.totalCrushedTonnage.toLocaleString()} <span className="text-xs text-pink-400">تن</span>
          </p>
          <p className="text-[11px] text-[#8A9DB0] mt-1">خوراک سنگ‌شکن ۱ و ۲</p>
        </button>

        {/* فاز ۶: محصولات نهایی */}
        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            activeStageFilter === 'COMPLETED' ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-green-400">۶. محصولات دانه‌بندی</span>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-xl font-bold font-mono text-green-400 truncate">
            {(metrics.totalLumpProduced + metrics.totalFinesProduced).toLocaleString()} <span className="text-xs text-white">تن</span>
          </p>
          <p className="text-[11px] text-[#8A9DB0] mt-1">کلوخه و نرمه نهایی</p>
        </button>
      </div>

      {/* نوار فیلتر و جستجو و اقدامات گروهی */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی کد ساب‌بلوک..."
              className="px-4 py-2 pr-9 bg-[#0A1628] border border-white/10 rounded-xl text-white text-xs placeholder-[#4A6A8A] focus:outline-none focus:border-[#00D4FF] min-w-[220px]"
            />
            <FunnelIcon className="w-4 h-4 text-[#4A6A8A] absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveStageFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeStageFilter === 'ALL' ? 'bg-[#00D4FF] text-[#0A1628] font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
              }`}
            >
              همه ({subBlocks.length})
            </button>
            <button
              onClick={() => setActiveStageFilter('SAMPLING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeStageFilter === 'SAMPLING' ? 'bg-yellow-500 text-black font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
              }`}
            >
              نمونه‌برداری
            </button>
            <button
              onClick={() => setActiveStageFilter('LAB')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeStageFilter === 'LAB' ? 'bg-purple-500 text-white font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
              }`}
            >
              آزمایشگاه
            </button>
            <button
              onClick={() => setActiveStageFilter('CLASSIFY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeStageFilter === 'CLASSIFY' ? 'bg-blue-500 text-white font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
              }`}
            >
              طبقه‌بندی
            </button>
            <button
              onClick={() => setActiveStageFilter('CRUSHING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeStageFilter === 'CRUSHING' ? 'bg-pink-500 text-white font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
              }`}
            >
              خطوط خردایش
            </button>
          </div>
        </div>

        {/* دکمه طبقه‌بندی هوشمند دسته‌ای */}
        <button
          onClick={handleAutoClassifyAll}
          className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>طبقه‌بندی خودکار ساب‌بلوک‌های آنالیزشده</span>
        </button>
      </div>

      {/* جدول ساب‌بلوک‌ها */}
      <SubBlocksTable
        subBlocks={filteredSubBlocks}
        onRowClick={(sb) => handleActionClick(sb, 'view')}
        onActionClick={(sb, type) => handleActionClick(sb, type)}
      />

      {/* مودال تفکیک ساب‌بلوک‌های جدید برای بلوک */}
      {activeModal === 'createSubBlocks' && selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D1B2E] border border-white/10 rounded-2xl p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-white">تفکیک ساب‌بلوک‌ها برای بلوک {selectedBlock.code}</h3>
            <p className="text-xs text-[#8A9DB0]">
              بر اساس هندسه و الگوی چال‌پاشی، بلوک به قطعات استخراجی تفکیک و کدهای استاندارد اختصاص داده می‌شود.
            </p>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">تعداد ساب‌بلوک‌ها برای ایجاد</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newSubBlockCount}
                onChange={(e) => setNewSubBlockCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">مجموع تناژ تخمینی کل بلوک (تن)</label>
              <input
                type="number"
                step="500"
                value={newTotalTonnage}
                onChange={(e) => setNewTotalTonnage(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
              />
              <span className="text-[11px] text-[#4A6A8A] mt-1 block font-mono">
                میانگین هر ساب‌بلوک: {Math.round(newTotalTonnage / (newSubBlockCount || 1)).toLocaleString()} تن
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm text-[#8A9DB0] hover:text-white"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateSubBlocks}
                className="px-5 py-2.5 bg-[#00D4FF] hover:bg-[#00B4D8] text-[#0A1628] font-bold rounded-xl text-sm transition-all"
              >
                ایجاد و تفکیک
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال‌های عملیات چرخه */}
      {activeModal === 'sample' && activeSubBlock && (
        <SamplingModal
          subBlock={activeSubBlock}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'lab' && activeSubBlock && (
        <LabResultsModal
          subBlock={activeSubBlock}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'classify' && activeSubBlock && (
        <ClassificationModal
          subBlock={activeSubBlock}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'destination' && activeSubBlock && (
        <DestinationModal
          subBlock={activeSubBlock}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'crush' && activeSubBlock && (
        <CrusherConsumptionModal
          subBlock={activeSubBlock}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'detail' && activeSubBlock && (
        <SubBlockDetailModal
          subBlock={activeSubBlock}
          onClose={() => setActiveModal(null)}
          onOpenAction={(type) => setActiveModal(type)}
        />
      )}
    </div>
  );
}
