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
  ChartBarIcon,
  FolderIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  BlockRepository, 
  SubBlockRepository,
  DrillingPointRepository,
  MonthlyBandRepository,
  DrillPatternDesignRepository
} from '../../../../../core/infrastructure/repositories';
import type { Block, SubBlock, DestinationType, StakeholderRole } from '../../../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';
import { SubBlocksTable } from '../SubBlocksTable/SubBlocksTable';
import { SubBlockLifecycleOverviewBar } from './SubBlockLifecycleOverviewBar';
import { getSubBlockStageStates } from './SubBlockSteppedProgress';
import { SamplingModal } from '../LifecycleModals/SamplingModal';
import { LabResultsModal } from '../LifecycleModals/LabResultsModal';
import { ClassificationModal } from '../LifecycleModals/ClassificationModal';
import { DestinationModal } from '../LifecycleModals/DestinationModal';
import { CrusherConsumptionModal } from '../LifecycleModals/CrusherConsumptionModal';
import { SubBlockDetailModal } from '../LifecycleModals/SubBlockDetailModal';
import { BlockCodeDisplay, formatBlockCode } from '../../../../../shared/components/BlockCodeDisplay';
import { DESTINATION_LABELS } from '../../../../../core/domain/constants/mine.constants';

// کامپوننت‌های ارکان ۴گانه و چرخه ۱۳ مرحله‌ای
import { StakeholderPerspectiveBar } from '../StakeholderPerspectiveBar';
import { MonthlyBandsTab } from '../MonthlyBands/MonthlyBandsTab';
import { DrillPatternTab } from '../DrillPattern/DrillPatternTab';
import { DynamicStockpileTab } from '../Stockpiles/DynamicStockpileTab';
import { MiningWorkflowOverview13Steps } from '../MiningWorkflowOverview13Steps';

interface BlockSubBlockLifecycleHubProps {
  initialBlockId?: string;
  onBlockSelect?: (block: Block) => void;
}

type MainHubTab = 'SUB_BLOCKS' | 'MONTHLY_BANDS' | 'DRILL_PATTERNS' | 'DYNAMIC_STOCKPILES' | 'WORKFLOW_GUIDE';

export function BlockSubBlockLifecycleHub({ initialBlockId, onBlockSelect }: BlockSubBlockLifecycleHubProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(initialBlockId || '');
  const [subBlocks, setSubBlocks] = useState<SubBlock[]>([]);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // تب فعال و نقش ذینفع
  const [activeTab, setActiveTab] = useState<MainHubTab>('SUB_BLOCKS');
  const [stakeholderRole, setStakeholderRole] = useState<StakeholderRole>('ALL');

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

  // شمارش موارد نیازمند اقدام برای هر رکن
  const pendingCounts = useMemo(() => {
    const bands = MonthlyBandRepository.getAll();
    const patterns = DrillPatternDesignRepository.getAll();

    return {
      clientBands: bands.filter(b => b.status === 'SUBMITTED_BY_SUPERVISION').length,
      supervisionPermits: patterns.filter(p => p.status === 'PENDING_SUPERVISION_REVIEW').length,
      miningDrilling: patterns.filter(p => p.status === 'PERMIT_ISSUED').length,
      crushingFeeds: 2,
    };
  }, [blocks, subBlocks]);

  // فیلتر کردن ساب‌بلوک‌ها
  const filteredSubBlocks = useMemo(() => {
    return subBlocks.filter(sb => {
      // جستجو
      if (searchTerm && !sb.code.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // فیلتر مرحله بر اساس نوار پیشرفت ۶ مرحله‌ای
      if (activeStageFilter === 'ALL') return true;
      const { currentStageIndex } = getSubBlockStageStates(sb);
      if (activeStageFilter === 'DEFINITION') return currentStageIndex === 0;
      if (activeStageFilter === 'SAMPLING') return currentStageIndex === 1;
      if (activeStageFilter === 'LAB') return currentStageIndex === 2;
      if (activeStageFilter === 'CLASSIFY') return currentStageIndex === 3;
      if (activeStageFilter === 'DESTINATION') return currentStageIndex === 4;
      if (activeStageFilter === 'CRUSHING') return currentStageIndex === 5;
      return true;
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

  // ایجاد سریع ساب‌بلوک‌ها با کدگذاری استاندارد SA, SB, SC, SD
  const handleCreateSubBlocks = () => {
    if (!selectedBlock) return;
    SubBlockLifecycleService.createSubBlocksForBlock(
      selectedBlock.id,
      newSubBlockCount,
      selectedBlock.code,
      selectedBlock.targetLevel,
      newTotalTonnage,
      'دفتر فنی پیمانکار استخراج'
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
        SubBlockLifecycleService.autoClassifySubBlock(sb.id, 'موتور هوشمند طبقه‌بندی زمین‌شناسی');
      }
    });
    loadData();
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* نوار تغییر دیدگاه ارکان ۴گانه سامانه */}
      <StakeholderPerspectiveBar
        activeRole={stakeholderRole}
        onRoleChange={setStakeholderRole}
        pendingCounts={pendingCounts}
      />

      {/* نوار سوئیچ تب‌های ماژول‌های ۱۳ مرحله‌ای */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('SUB_BLOCKS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SUB_BLOCKS'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>شناسنامه و چرخه ساب‌بلوک‌ها (مراحل ۶ تا ۹ و ۱۲)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px] font-mono">
              {metrics.totalSubBlocks}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MONTHLY_BANDS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MONTHLY_BANDS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderIcon className="w-4 h-4" />
            <span>باندهای ماهانه (مراحل ۱ و ۲)</span>
            {pendingCounts.clientBands > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/30 text-amber-200 text-[10px] font-bold">
                {pendingCounts.clientBands} جدید
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('DRILL_PATTERNS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DRILL_PATTERNS'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <WrenchScrewdriverIcon className="w-4 h-4" />
            <span>شبکه حفاری و مجوزها (مراحل ۳، ۴ و ۵)</span>
            {pendingCounts.supervisionPermits > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/30 text-cyan-200 text-[10px] font-bold">
                {pendingCounts.supervisionPermits} مجوز
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('DYNAMIC_STOCKPILES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DYNAMIC_STOCKPILES'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            <span>سرویس‌شمار و موجودی دپوها (مراحل ۱۰ و ۱۱)</span>
          </button>

          <button
            onClick={() => setActiveTab('WORKFLOW_GUIDE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'WORKFLOW_GUIDE'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpenIcon className="w-4 h-4" />
            <span>راهنمای تعاملی ۱۳ مرحله</span>
          </button>
        </div>
      </div>

      {/* بدنه بر اساس تب فعال */}
      {activeTab === 'WORKFLOW_GUIDE' && (
        <MiningWorkflowOverview13Steps onStepSelect={(step) => {
          if (step <= 2) setActiveTab('MONTHLY_BANDS');
          else if (step <= 5) setActiveTab('DRILL_PATTERNS');
          else if (step <= 9 || step === 12) setActiveTab('SUB_BLOCKS');
          else if (step <= 11) setActiveTab('DYNAMIC_STOCKPILES');
        }} />
      )}

      {activeTab === 'MONTHLY_BANDS' && (
        <MonthlyBandsTab stakeholderRole={stakeholderRole} />
      )}

      {activeTab === 'DRILL_PATTERNS' && (
        <DrillPatternTab stakeholderRole={stakeholderRole} />
      )}

      {activeTab === 'DYNAMIC_STOCKPILES' && (
        <DynamicStockpileTab stakeholderRole={stakeholderRole} />
      )}

      {activeTab === 'SUB_BLOCKS' && (
        <>
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
                  از تفکیک ساب‌بلوک‌ها (SA, SB, SC, SD) تا نمونه‌برداری پودری، آنالیز XRF، طبقه‌بندی عیار، تعیین مقصد و بارگیری به دپوها
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
                        بلوک {formatBlockCode(b.code)} (تراز {b.targetLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {(stakeholderRole === 'ALL' || stakeholderRole === 'MINING_CONTRACTOR' || stakeholderRole === 'SUPERVISION') && (
                  <button
                    onClick={() => setActiveModal('createSubBlocks')}
                    className="mt-5 px-4 py-2.5 bg-[#00D4FF] hover:bg-[#00B4D8] text-[#0A1628] font-bold rounded-2xl text-sm transition-all shadow-lg shadow-[#00D4FF]/20 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>تفکیک ساب‌بلوک جدید (SA, SB, SC, SD)</span>
                  </button>
                )}

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
                  <BlockCodeDisplay code={selectedBlock.code} className="text-white font-bold text-sm" />
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

          {/* نوار پیشرفت مرحله‌ای کل چرخه ساب‌بلوک‌ها (Master Stepped Lifecycle Pipeline Tracker) */}
          <SubBlockLifecycleOverviewBar
            subBlocks={subBlocks}
            activeStageFilter={activeStageFilter}
            onSelectStageFilter={setActiveStageFilter}
          />

          {/* نوار فیلتر و جستجو و اقدامات گروهی */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center flex-wrap gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجوی کد ساب‌بلوک (مانند 1040 B 32 – SA)..."
                  className="px-4 py-2 pr-9 bg-[#0A1628] border border-white/10 rounded-xl text-white text-xs placeholder-[#4A6A8A] focus:outline-none focus:border-[#00D4FF] min-w-[240px]"
                />
                <FunnelIcon className="w-4 h-4 text-[#4A6A8A] absolute right-3 top-2.5" />
              </div>

              <div className="flex items-center flex-wrap gap-1">
                <button
                  onClick={() => setActiveStageFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStageFilter === 'ALL' ? 'bg-[#00D4FF] text-[#0A1628] font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
                  }`}
                >
                  همه ({subBlocks.length})
                </button>
                <button
                  onClick={() => setActiveStageFilter('DEFINITION')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStageFilter === 'DEFINITION' ? 'bg-slate-300 text-slate-950 font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
                  }`}
                >
                  ۱. تفکیک
                </button>
                <button
                  onClick={() => setActiveStageFilter('SAMPLING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStageFilter === 'SAMPLING' ? 'bg-yellow-500 text-black font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
                  }`}
                >
                  ۲. نمونه‌برداری
                </button>
                <button
                  onClick={() => setActiveStageFilter('LAB')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStageFilter === 'LAB' ? 'bg-purple-500 text-white font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
                  }`}
                >
                  ۳. آزمایشگاه
                </button>
                <button
                  onClick={() => setActiveStageFilter('CLASSIFY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStageFilter === 'CLASSIFY' ? 'bg-blue-500 text-white font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
                  }`}
                >
                  ۴. طبقه‌بندی
                </button>
                <button
                  onClick={() => setActiveStageFilter('DESTINATION')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStageFilter === 'DESTINATION' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
                  }`}
                >
                  ۵. تعیین مقصد
                </button>
                <button
                  onClick={() => setActiveStageFilter('CRUSHING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeStageFilter === 'CRUSHING' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/5 text-[#8A9DB0] hover:text-white'
                  }`}
                >
                  ۶. تحویل و بارگیری
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
        </>
      )}

      {/* مودال تفکیک ساب‌بلوک‌های جدید برای بلوک */}
      {activeModal === 'createSubBlocks' && selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0D1B2E] border border-white/10 rounded-2xl p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BlockCodeDisplay code={selectedBlock.code} prefix="تفکیک ساب‌بلوک‌ها برای بلوک" className="text-cyan-400 font-bold" />
            </h3>
            <p className="text-xs text-[#8A9DB0]">
              بر اساس هندسه و الگوی چال‌پاشی، بلوک به قطعات استخراجی تفکیک و کدهای استاندارد (مانند <span dir="ltr" className="font-mono text-cyan-300 font-bold">{formatBlockCode(selectedBlock.code)} – SA, SB, SC, SD</span>) اختصاص داده می‌شود.
            </p>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">تعداد ساب‌بلوک‌ها برای ایجاد</label>
              <select
                value={newSubBlockCount}
                onChange={(e) => setNewSubBlockCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0A1628] border border-white/20 rounded-xl text-white text-xs"
              >
                <option value={2}>۲ ساب‌بلوک (SA, SB)</option>
                <option value={3}>۳ ساب‌بلوک (SA, SB, SC)</option>
                <option value={4}>۴ ساب‌بلوک (SA, SB, SC, SD)</option>
                <option value={6}>۶ ساب‌بلوک (SA تا SF)</option>
                <option value={8}>۸ ساب‌بلوک (SA تا SH)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">تناژ تخمینی کل بلوک (تن)</label>
              <input
                type="number"
                value={newTotalTonnage}
                onChange={(e) => setNewTotalTonnage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0A1628] border border-white/20 rounded-xl text-white font-mono text-xs"
              />
              <span className="text-[11px] text-[#00D4FF] mt-1 block">
                میانگین تناژ هر ساب‌بلوک: {Math.round(newTotalTonnage / newSubBlockCount).toLocaleString()} تن
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
              >
                انصراف
              </button>
              <button
                onClick={handleCreateSubBlocks}
                className="px-5 py-2 rounded-xl bg-[#00D4FF] hover:bg-[#00B4D8] text-[#0A1628] text-xs font-bold shadow-lg shadow-[#00D4FF]/20"
              >
                ایجاد و تفکیک ساب‌بلوک‌ها
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال‌های اختصاصی مراحل ساب‌بلوک */}
      {activeModal === 'sample' && activeSubBlock && (
        <SamplingModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          subBlock={activeSubBlock}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'lab' && activeSubBlock && (
        <LabResultsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          subBlock={activeSubBlock}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'classify' && activeSubBlock && (
        <ClassificationModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          subBlock={activeSubBlock}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'destination' && activeSubBlock && (
        <DestinationModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          subBlock={activeSubBlock}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'crush' && activeSubBlock && (
        <CrusherConsumptionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          subBlock={activeSubBlock}
          onSuccess={handleModalSuccess}
        />
      )}

      {activeModal === 'detail' && activeSubBlock && (
        <SubBlockDetailModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          subBlock={activeSubBlock}
        />
      )}
    </div>
  );
}
