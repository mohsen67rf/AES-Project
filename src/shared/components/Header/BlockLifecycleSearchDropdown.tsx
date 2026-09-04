// src/shared/components/Header/BlockLifecycleSearchDropdown.tsx

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Layers,
  MapPin,
  Beaker,
  TestTube,
  Flame,
  Truck,
  ClipboardList,
  Sparkles,
  HardHat,
  Factory,
  ChevronLeft,
  Activity,
  Compass,
} from 'lucide-react';
import { BlockRepository, SubBlockRepository } from '../../../core/infrastructure/repositories';
import { TaskService } from '../../../modules/tasks/services/TaskService';
import type { UnitTask } from '../../../core/domain/types/task.types';

interface BlockLifecycleSearchDropdownProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssignModalForBlock?: (blockCode: string, bench: string) => void;
  onViewTaskOnMap?: (task: UnitTask) => void;
}

export const BlockLifecycleSearchDropdown: React.FC<BlockLifecycleSearchDropdownProps> = ({
  searchQuery,
  isOpen,
  onClose,
  onOpenAssignModalForBlock,
  onViewTaskOnMap,
}) => {
  const navigate = useNavigate();

  // Normalize query string for fuzzy block matching
  const normalizedQuery = useMemo(() => {
    return searchQuery.trim().toLowerCase().replace(/[\s\-_]+/g, '');
  }, [searchQuery]);

  // Find matching block or create dynamic block spotlight
  const blockMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const allBlocks = BlockRepository.getAll();

    // 1. Direct code/name match
    const matched = allBlocks.find((b) => {
      const codeNorm = b.code.toLowerCase().replace(/[\s\-_]+/g, '');
      const idNorm = b.id.toLowerCase().replace(/[\s\-_]+/g, '');
      return (
        codeNorm.includes(normalizedQuery) ||
        normalizedQuery.includes(codeNorm) ||
        idNorm.includes(normalizedQuery) ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    if (matched) return matched;

    // 2. Pattern check for blocks like "1040 B33", "1040-B33", "B33", "1040"
    const has1040 = normalizedQuery.includes('1040');
    const has33 = normalizedQuery.includes('33') || normalizedQuery.includes('b33');
    const has32 = normalizedQuery.includes('32') || normalizedQuery.includes('b32');

    if (has1040 && has33) {
      // Find or return 1040 B 33
      return allBlocks.find((b) => b.code.includes('33')) || {
        id: 'block-1040-b33',
        code: '1040 B 33',
        name: 'بلوک استخراجی ۱۰۴۰-۳۳ (پله ۱۰۴۰)',
        targetLevel: 1040,
        blockNumber: 33,
        status: 'APPROVED' as const,
        geometry: { type: 'Polygon' as const, coordinates: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (has1040 && has32) {
      return allBlocks.find((b) => b.code.includes('32')) || null;
    }

    // If query starts with number or "b", check if it matches any block
    if (/^(10\d\d|b\d\d)/i.test(normalizedQuery)) {
      return allBlocks[0] || null;
    }

    return null;
  }, [normalizedQuery, searchQuery]);

  // Subblocks of the matched block
  const blockSubBlocks = useMemo<SubBlock[]>(() => {
    if (!blockMatch) return [];
    if (typeof SubBlockRepository.getByBlockId === 'function') {
      return SubBlockRepository.getByBlockId(blockMatch.id);
    }
    return SubBlockRepository.findBy('blockId', blockMatch.id);
  }, [blockMatch]);

  // Assigned tasks for this block
  const relatedTasks = useMemo<UnitTask[]>(() => {
    if (!blockMatch) return [];
    const allTasks = TaskService.getAllTasks();
    const blockCodeClean = blockMatch.code.toLowerCase().replace(/[\s\-_]+/g, '');
    const seen = new Set<string>();

    return allTasks.filter((t) => {
      if (!t || !t.id || seen.has(t.id)) return false;
      const matches =
        t.relatedEntityId === blockMatch.id ||
        (t.relatedEntityCode && t.relatedEntityCode.toLowerCase().replace(/[\s\-_]+/g, '') === blockCodeClean) ||
        (t.mapLocation?.blockCode && t.mapLocation.blockCode.toLowerCase().replace(/[\s\-_]+/g, '') === blockCodeClean) ||
        t.title.includes(blockMatch.code) ||
        t.description.includes(blockMatch.code);
      if (matches) {
        seen.add(t.id);
        return true;
      }
      return false;
    });
  }, [blockMatch]);

  // General pages match if query is not strictly a block
  const generalPages = useMemo(() => {
    const pages = [
      {
        title: 'مدیریت و طراحی بلوک‌ها',
        url: '/blocks-management',
        desc: 'شبکه چال‌زنی، صدور پرمیت و ساب‌بندی بلوک‌های استخراجی',
        icon: Layers,
        badge: 'مدیریت بلوک',
      },
      {
        title: 'چرخه عمر ساب‌بلوک‌ها و خطوط خردایش',
        url: '/mining-lifecycle',
        desc: 'ردگیری ۱۳ مرحله‌ای کاتینگ‌ها، آزمایشگاه، ساب‌بندی و مقاصد باربری',
        icon: Activity,
        badge: 'چرخه عمر',
      },
      {
        title: 'نقشه سه‌بعدی و استودیو GIS معدن',
        url: '/mine/map',
        desc: 'توپوگرافی پیت، مدل ژئودتیک پله‌های استخراجی و موقعیت بلوک‌ها',
        icon: Compass,
        badge: 'نقشه و GIS',
      },
      {
        title: 'انبار مواد ناریه و محاسبات آتشباری',
        url: '/warehouse',
        desc: 'محاسبه خرج ویژه، آنفو، فتیله و بارنامه خروجی مواد ناریه',
        icon: Flame,
        badge: 'انبار و ناریه',
      },
      {
        title: 'مدیریت و دیسپاچینگ ماشین‌آلات',
        url: '/equipment',
        desc: 'ناوگان شاول‌ها، لودرها، دامپتراک‌ها و سرویس‌شمار باربری',
        icon: Truck,
        badge: 'ناوگان پیت',
      },
      {
        title: 'میز کار تخصصی واحدها و کارتابل',
        url: '/workspace',
        desc: 'پیگیری تسک‌ها، ارجاعات شیفت و یادداشت‌های پرسنل',
        icon: ClipboardList,
        badge: 'کارتابل',
      },
    ];

    if (!searchQuery.trim()) return pages;

    return pages.filter(
      (p) =>
        p.title.includes(searchQuery) ||
        p.desc.includes(searchQuery) ||
        p.badge.includes(searchQuery)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleNavigate = (url: string) => {
    onClose();
    navigate(url);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#0E1527] border border-[#24356B] shadow-2xl text-white overflow-hidden max-h-[85vh] flex flex-col font-sans backdrop-blur-xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Query Summary Bar */}
        <div className="px-4 py-2.5 border-b border-[#24356B]/60 bg-[#101935] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#8E9EB8]">
            <Search className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>
              نتایج جستجوی هوشمند برای:{' '}
              <strong className="text-white font-mono">{searchQuery || 'همه بخش‌ها'}</strong>
            </span>
          </div>

          <span className="text-[10px] text-slate-400">
            برای انتخاب از کلیدهای ناوبری یا کلیک استفاده کنید
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 space-y-5 divide-y divide-[#24356B]/40">
          {/* ============================================================ */}
          {/* IF BLOCK IS MATCHED: FULL LIFECYCLE PIPELINE & STAGES         */}
          {/* ============================================================ */}
          {blockMatch && (
            <div className="space-y-4">
              {/* Block Header Spotlight Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#101935] via-[#142247] to-[#101935] border border-[#00D2FF]/40 shadow-lg shadow-[#00D2FF]/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#00D2FF]/20 border border-[#00D2FF]/50 text-[#00D2FF] flex items-center justify-center font-black text-sm shadow-md shadow-[#00D2FF]/20">
                      {blockMatch.code.split(' ')[1] || 'BLK'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-white">
                          بلوک معدنی {blockMatch.code}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40">
                          پله {blockMatch.targetLevel || 1040} متر
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          وضعیت: {blockMatch.status === 'APPROVED' ? 'تأیید شده / فعال در چرخه' : blockMatch.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#8E9EB8] mt-1">
                        {blockMatch.name} | سنگ‌آهن مگنتیت متراکم (Fe ~ 61.8%) | {blockSubBlocks.length > 0 ? `${blockSubBlocks.length} ساب‌بلوک عیاری تفکیک‌شده` : '۴ ساب‌بلوک تفکیکی'}
                      </p>
                    </div>
                  </div>

                  {/* Fast Action: Assign Task with Map */}
                  <div className="flex items-center gap-2">
                    {onOpenAssignModalForBlock && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAssignModalForBlock(blockMatch.code, String(blockMatch.targetLevel || 1040));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0099FF] hover:from-[#00c0ea] hover:to-[#0088ea] text-[#070F1E] font-black text-xs transition-all shadow-lg shadow-[#00D2FF]/20 flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>ارجاع تسک جدید با جانمایی نقشه</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* End-to-End Mining Lifecycle Pipeline List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#8E9EB8] px-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00D2FF]" />
                    <span>مراحل چرخه کامل عملیاتی و صفحات مربوط به بلوک {blockMatch.code}:</span>
                  </span>
                  <span className="text-[11px] text-[#00D2FF]">از حفاری و نمونه‌گیری تا آزمایشگاه و مقصد</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* Step 1: Drilling & Blast Patterns */}
                  <div
                    onClick={() => handleNavigate(`/blocks-management?block=${encodeURIComponent(blockMatch.code)}`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HardHat className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۱. طراحی و عملیات حفاری چال‌ها
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300">
                            Drilling
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          شبکه ۳×۳.۵متر، ۵۲ چال با قطر ۷۶mm، عمق ۱۲.۵متر و پرمیت فعال
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>

                  {/* Step 2: Powder Cuttings Sampling */}
                  <div
                    onClick={() => handleNavigate(`/mining-lifecycle?blockId=${encodeURIComponent(blockMatch.id)}&tab=sampling`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TestTube className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۲. نمونه‌گیری از پودر چال‌ها
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                            Sampling
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          برداشت نمونه‌های پودری SMP-1040-33-SA تا SD و ارسال به آزمایشگاه
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>

                  {/* Step 3: Laboratory Assays & XRF */}
                  <div
                    onClick={() => handleNavigate(`/mining-lifecycle?blockId=${encodeURIComponent(blockMatch.id)}&tab=lab`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Beaker className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۳. آنالیز آزمایشگاهی و عیار XRF
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300">
                            Assays
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          عیارسنجی Fe 61.8%، FeO 21.4%، کنترل گوگرد S و فسفر P
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>

                  {/* Step 4: Sub-Blocks Classification */}
                  <div
                    onClick={() => handleNavigate(`/mining-lifecycle?blockId=${encodeURIComponent(blockMatch.id)}&tab=subblocks`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۴. ساب‌بندی و زون‌بندی عیاری
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300">
                            Sub-Blocks
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          تفکیک ساب‌بلوک‌های SA (پرعیار DSO)، SB (متوسط)، SC (کم‌عیار)، SD (باطله)
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>

                  {/* Step 5: Explosives & Blasting */}
                  <div
                    onClick={() => handleNavigate(`/warehouse?block=${encodeURIComponent(blockMatch.code)}`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۵. مواد ناریه و محاسبات آتشباری
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300">
                            Blasting
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          محاسبه خرج ویژه ۰.۶۸ kg/m³، آنفو، فتیله و حواله خروج انبار ناریه
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>

                  {/* Step 6: Crusher & Destination */}
                  <div
                    onClick={() => handleNavigate(`/mining-lifecycle?blockId=${encodeURIComponent(blockMatch.id)}&tab=destination`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Factory className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۶. بارگیری، مقصد دپوها و سنگ‌شکن
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                            Destination
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          تخصیص به بین سنگ‌شکن خط ۱ و دپوی پرعیار با تراک‌های ۱۰۰ تنی
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>

                  {/* Step 7: GIS Mine Map Location */}
                  <div
                    onClick={() => handleNavigate(`/mine/map?block=${encodeURIComponent(blockMatch.code)}`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۷. موقعیت نقشه مهندسی و توپوگرافی پیت
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#00D2FF]/20 text-[#00D2FF]">
                            GIS Map
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          جانمایی پله ۱۰۴۰ و مرزبندی ژئودتیک در نقشه آنلاین معدن
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>

                  {/* Step 8: Equipment Haulage & Loading */}
                  <div
                    onClick={() => handleNavigate(`/equipment?block=${encodeURIComponent(blockMatch.code)}`)}
                    className="p-3 rounded-xl bg-[#101935] hover:bg-[#142247] border border-[#24356B]/60 hover:border-[#00D2FF]/60 cursor-pointer transition-all group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            ۸. تخصیص شاول و ناوگان باربری
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-orange-500/20 text-orange-300">
                            Dispatch
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-0.5 line-clamp-1">
                          اختصاص شاول هیدرولیکی EX-1200 #01 و ثبت سرویس‌شمار باربری
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>
                </div>
              </div>

              {/* Tasks Assigned to this Block */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#8E9EB8] px-1">
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-[#00D2FF]" />
                    <span>تسک‌ها و دستورکارهای ارجاعی مربوط به بلوک {blockMatch.code} ({relatedTasks.length}):</span>
                  </span>
                </div>

                {relatedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {relatedTasks.map((task, idx) => (
                      <div
                        key={`task-res-${task.id || 'tsk'}-${idx}`}
                        className="p-3 rounded-xl bg-[#101935] border border-[#24356B]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#00D2FF]/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-black bg-[#24356B] text-[#00D2FF]">
                              {task.code}
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-md">
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-[#8E9EB8]">
                            <span>واحد: {task.department}</span>
                            <span>مسئول: {task.assignedUserName || task.assignedRole}</span>
                            <span className="text-amber-400">
                              مهلت: {new Date(task.dueDate).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                        </div>

                        {/* View on map button */}
                        {onViewTaskOnMap && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onViewTaskOnMap(task);
                            }}
                            className="self-end sm:self-center px-2.5 py-1 text-[11px] rounded-lg bg-[#00D2FF]/15 text-[#00D2FF] hover:bg-[#00D2FF]/25 border border-[#00D2FF]/30 transition-colors flex items-center gap-1 flex-shrink-0"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>مشاهده موقعیت روی نقشه</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#101935]/60 border border-[#24356B]/40 text-xs text-[#8E9EB8] flex items-center justify-between">
                    <span>هنوز تسک فعالی برای این بلوک ارجاع نشده است.</span>
                    {onOpenAssignModalForBlock && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAssignModalForBlock(blockMatch.code, String(blockMatch.targetLevel || 1040));
                        }}
                        className="text-[#00D2FF] hover:underline font-bold text-xs"
                      >
                        + ارجاع اولین تسک برای {blockMatch.code}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* GENERAL PAGES / MODULES (Shown always or when no direct block) */}
          {/* ============================================================ */}
          <div className="space-y-2 pt-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#8E9EB8] px-1">
              <span>صفحات، کادرها و ماژول‌های سامانه:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {generalPages.map((page, idx) => {
                const IconComponent = page.icon;
                return (
                  <div
                    key={`gen-pg-${page.url}-${idx}`}
                    onClick={() => handleNavigate(page.url)}
                    className="p-2.5 rounded-xl bg-[#101935]/70 hover:bg-[#142247] border border-[#24356B]/40 hover:border-[#00D2FF]/40 cursor-pointer transition-all flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#24356B]/40 group-hover:bg-[#00D2FF]/20 text-[#8E9EB8] group-hover:text-[#00D2FF] flex items-center justify-center flex-shrink-0 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-[#00D2FF] truncate transition-colors">
                        {page.title}
                      </div>
                      <div className="text-[10px] text-[#8E9EB8] truncate">
                        {page.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 border-t border-[#24356B]/60 bg-[#0C1222] flex items-center justify-between text-[11px] text-[#8E9EB8]">
          <div className="flex items-center gap-2">
            <span>جستجوی سریع بلوک‌ها:</span>
            <span className="px-1.5 py-0.5 rounded bg-[#101935] border border-[#24356B] text-[#00D2FF] font-mono">
              1040 B33
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#101935] border border-[#24356B] text-slate-300 font-mono">
              1040 B 32
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            بستن (Esc)
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
