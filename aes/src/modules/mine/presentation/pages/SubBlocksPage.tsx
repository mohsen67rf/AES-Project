// src/modules/mine/presentation/pages/SubBlocksPage.tsx

import { useState, useEffect } from 'react';
import { 
  CubeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  MapPinIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentPlusIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// ============================================
// نوع‌های داده
// ============================================

type SubBlockStatus = 
  | 'CREATED'
  | 'SAMPLED'
  | 'LAB_COMPLETED'
  | 'CLASSIFIED'
  | 'DESTINATION_ASSIGNED'
  | 'COMPLETED';

interface SubBlock {
  id: string;
  blockId: string;
  code: string;
  sequence: number;
  status: SubBlockStatus;
  materialClass?: string;
  destination?: string;
  assay?: number;
  createdBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface Block {
  id: string;
  code: string;
  name: string;
  targetLevel: number;
  blockNumber: number;
}

const SubBlockStatusLabels: Record<SubBlockStatus, string> = {
  'CREATED': 'ایجاد شده',
  'SAMPLED': 'نمونه‌برداری شده',
  'LAB_COMPLETED': 'نتیجه آزمایشگاه',
  'CLASSIFIED': 'طبقه‌بندی شده',
  'DESTINATION_ASSIGNED': 'مقصد تعیین شده',
  'COMPLETED': 'تکمیل شده',
};

const DESTINATION_LABELS: Record<string, string> = {
  'WASTE_DUMP_ROCK': 'دامپ باطله سنگی',
  'WASTE_DUMP_ALLUVIAL': 'دامپ آبرفت',
  'HIGH_GRADE_STOCKPILE': 'دپوی پرعیار',
  'MEDIUM_GRADE_STOCKPILE': 'دپوی عیار متوسط',
  'LOW_GRADE_STOCKPILE': 'دپوی کم‌عیار',
  'CRUSHER_FEED': 'خوراک کارخانه',
};

// ============================================
// سرویس‌های دیتابیس
// ============================================

const SUBBLOCKS_KEY = 'aes_subblocks';

function getSubBlocks(blockId?: string): SubBlock[] {
  try {
    const data = localStorage.getItem(SUBBLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSubBlocks(subBlocks: SubBlock[]): void {
  localStorage.setItem(SUBBLOCKS_KEY, JSON.stringify(subBlocks));
}

function updateSubBlock(id: string, data: Partial<SubBlock>): SubBlock | null {
  const subBlocks = getSubBlocks();
  const index = subBlocks.findIndex(sb => sb.id === id);
  if (index === -1) return null;
  
  subBlocks[index] = {
    ...subBlocks[index],
    ...data,
    version: subBlocks[index].version + 1,
    updatedAt: new Date().toISOString(),
  };
  saveSubBlocks(subBlocks);
  return subBlocks[index];
}

function getSubBlockById(id: string): SubBlock | null {
  const subBlocks = getSubBlocks();
  return subBlocks.find(sb => sb.id === id) || null;
}

// ============================================
// ===== ۱. ThemeContext (داخلی) =====
// ============================================

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('aes_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('aes_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return { isDark, toggleTheme };
}

// ============================================
// ===== ۲. DateRangePicker (داخلی) =====
// ============================================

function DateRangePicker({ value, onChange, onClear }: any) {
  const { isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempStart, setTempStart] = useState(value.startDate || '');
  const [tempEnd, setTempEnd] = useState(value.endDate || '');

  const presets = [
    { label: 'امروز', value: 'today' },
    { label: 'دیروز', value: 'yesterday' },
    { label: 'این هفته', value: 'thisWeek' },
    { label: 'این ماه', value: 'thisMonth' },
    { label: 'ماه گذشته', value: 'lastMonth' },
    { label: 'این سال', value: 'thisYear' },
    { label: 'سال گذشته', value: 'lastYear' },
  ];

  const applyPreset = (preset: string) => {
    const now = new Date();
    let start = new Date(), end = new Date();
    switch (preset) {
      case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); break;
      case 'yesterday': start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59); break;
      case 'thisWeek': const d = now.getDay(); start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d + 1); end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - d)); break;
      case 'thisMonth': start = new Date(now.getFullYear(), now.getMonth(), 1); end = new Date(now.getFullYear(), now.getMonth() + 1, 0); break;
      case 'lastMonth': start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 0); break;
      case 'thisYear': start = new Date(now.getFullYear(), 0, 1); end = new Date(now.getFullYear(), 11, 31); break;
      case 'lastYear': start = new Date(now.getFullYear() - 1, 0, 1); end = new Date(now.getFullYear() - 1, 11, 31); break;
      default: return;
    }
    onChange({ startDate: start.toISOString(), endDate: end.toISOString(), preset });
    setShowPicker(false);
  };

  const applyCustomRange = () => {
    if (tempStart && tempEnd) {
      onChange({
        startDate: new Date(tempStart).toISOString(),
        endDate: new Date(tempEnd).toISOString(),
        preset: 'custom',
      });
      setShowPicker(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'انتخاب تاریخ';
    return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const hasValue = value.startDate || value.endDate;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm ${
          hasValue
            ? isDark
              ? 'border-[#AACCDD]/30 bg-[#AACCDD]/10 text-white'
              : 'border-[#1A2A3A]/30 bg-[#1A2A3A]/10 text-gray-800'
            : isDark
              ? 'border-[#AACCDD]/10 bg-white/5 text-[#8A9DB0] hover:border-[#AACCDD]/30'
              : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-gray-400'
        }`}
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{hasValue ? `${formatDate(value.startDate)} - ${formatDate(value.endDate)}` : 'انتخاب بازه زمانی'}</span>
        {hasValue && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[#4A6A8A] hover:text-red-400">
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </button>

      {showPicker && (
        <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl z-50 p-4 border ${
          isDark
            ? 'bg-[#0A1628] border-[#AACCDD]/20'
            : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => applyPreset(p.value)}
                className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                  value.preset === p.value
                    ? isDark
                      ? 'bg-[#AACCDD] text-[#1A2A3A]'
                      : 'bg-[#1A2A3A] text-white'
                    : isDark
                      ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>از تاریخ</label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-white/5 border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30'
                    : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تا تاریخ</label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-white/5 border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30'
                    : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
                }`}
              />
            </div>
            <button
              onClick={applyCustomRange}
              disabled={!tempStart || !tempEnd}
              className={`w-full py-1.5 rounded-lg transition-colors text-sm disabled:opacity-50 ${
                isDark
                  ? 'bg-[#AACCDD] text-[#1A2A3A] hover:bg-[#8A9DB0]'
                  : 'bg-[#1A2A3A] text-white hover:bg-[#2A3A4A]'
              }`}
            >
              اعمال بازه
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ===== ۳. AssayForm (فرم ثبت عیار) =====
// ============================================

function AssayFormModal({ 
  subBlocks, 
  onClose, 
  onSuccess 
}: { 
  subBlocks: SubBlock[];
  onClose: () => void;
  onSuccess: (results: any[]) => void;
}) {
  const { isDark } = useTheme();
  const [results, setResults] = useState<{ id: string; assay: string; isWaste: boolean; wasteType: 'سنگی' | 'آبرفتی' | '' }[]>(
    subBlocks.map(sb => ({ id: sb.id, assay: '', isWaste: false, wasteType: '' }))
  );
  const [loading, setLoading] = useState(false);

  const updateAssay = (id: string, value: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, assay: value, isWaste: false } : r));
  };

  const toggleWaste = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, isWaste: !r.isWaste, assay: '' } : r));
  };

  const updateWasteType = (id: string, type: 'سنگی' | 'آبرفتی') => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, wasteType: type } : r));
  };

  const handleSubmit = () => {
    for (const r of results) {
      if (!r.isWaste && !r.assay.trim()) {
        alert('لطفاً برای همه ساب‌بلوک‌ها عیار وارد کنید یا به عنوان باطله علامت‌گذاری کنید');
        return;
      }
      if (r.isWaste && !r.wasteType) {
        alert('لطفاً نوع باطله را مشخص کنید');
        return;
      }
    }

    setLoading(true);
    try {
      const formatted = results.map(r => ({
        subBlockId: r.id,
        assay: parseFloat(r.assay) || 0,
        isWaste: r.isWaste,
        wasteType: r.wasteType || undefined,
      }));
      onSuccess(formatted);
    } catch (error) {
      alert('خطا در ثبت نتایج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
      isDark ? 'bg-black/70' : 'bg-gray-900/50'
    }`}>
      <div className={`border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl ${
        isDark 
          ? 'bg-[#0A1628] border-[#AACCDD]/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>ثبت نتایج آنالیز آزمایشگاه</h3>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
          }`}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {results.map((r) => {
            const sb = subBlocks.find(s => s.id === r.id);
            return (
              <div key={r.id} className={`p-4 border rounded-xl ${
                isDark ? 'bg-[#13203A]/40 border-[#AACCDD]/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{sb?.code}</span>
                  <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                    <input
                      type="checkbox"
                      checked={r.isWaste}
                      onChange={() => toggleWaste(r.id)}
                      className="w-4 h-4 rounded border-[#AACCDD]/20 bg-[#0A1628] text-[#AACCDD]"
                    />
                    باطله
                  </label>
                </div>

                {r.isWaste ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateWasteType(r.id, 'سنگی')}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                        r.wasteType === 'سنگی'
                          ? 'bg-orange-500/30 text-orange-300 border border-orange-500/30'
                          : isDark
                            ? 'bg-[#0A1628] text-[#8A9DB0] border border-[#AACCDD]/10 hover:border-[#AACCDD]/30'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      🪨 باطله سنگی
                    </button>
                    <button
                      onClick={() => updateWasteType(r.id, 'آبرفتی')}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                        r.wasteType === 'آبرفتی'
                          ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/30'
                          : isDark
                            ? 'bg-[#0A1628] text-[#8A9DB0] border border-[#AACCDD]/10 hover:border-[#AACCDD]/30'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      🌊 باطله آبرفتی
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>عیار (%):</label>
                    <input
                      type="number"
                      value={r.assay}
                      onChange={(e) => updateAssay(r.id, e.target.value)}
                      placeholder="مثال: 26.5"
                      step="0.1"
                      className={`w-32 px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                        isDark
                          ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30'
                          : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
                      }`}
                    />
                    <span className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>(۰ تا ۱۰۰)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
            isDark
              ? 'bg-[#AACCDD] text-[#1A2A3A] hover:bg-[#8A9DB0]'
              : 'bg-[#1A2A3A] text-white hover:bg-[#2A3A4A]'
          }`}
        >
          {loading ? 'در حال ثبت...' : 'ثبت نتایج'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// ===== ۴. کامپوننت کارت آماری =====
// ============================================

function StatsCard({ title, value, icon: Icon, color, subtitle }: any) {
  const { isDark } = useTheme();
  
  return (
    <div className={`backdrop-blur-xl border rounded-xl p-5 transition-all duration-300 ${
      isDark 
        ? 'bg-[#13203A]/40 border-[#AACCDD]/10 hover:border-[#AACCDD]/30 hover:shadow-lg hover:shadow-[#AACCDD]/5' 
        : 'bg-white/60 border-gray-200 hover:border-[#1A2A3A]/30 hover:shadow-lg hover:shadow-gray-200/50'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ===== ۵. کامپوننت تاریخچه =====
// ============================================

function AuditLogButton({ entityId }: { entityId: string }) {
  const { isDark } = useTheme();
  const [show, setShow] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (show) {
      try {
        const data = localStorage.getItem('aes_audit_log');
        setLogs(data ? JSON.parse(data).filter((l: any) => l.entityId === entityId).slice(0, 10) : []);
      } catch {
        setLogs([]);
      }
    }
  }, [show, entityId]);

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className={`p-1.5 rounded-lg transition-colors ${
        isDark ? 'hover:bg-white/5 text-[#4A6A8A] hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'
      }`}>
        <ClockIcon className="w-4 h-4" />
      </button>
      {show && (
        <div className={`absolute left-0 mt-2 w-72 max-h-64 overflow-y-auto rounded-xl shadow-2xl z-50 p-3 border ${
          isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>تاریخچه تغییرات</h4>
          {logs.length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>تغییری ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log: any) => (
                <div key={log.id} className={`border-b pb-2 last:border-0 ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>
                      {new Date(log.changedAt).toLocaleString('fa-IR')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/20 text-yellow-300">
                      {log.action}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>{log.description}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>توسط: {log.changedByName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// ===== ۶. کامپوننت اصلی =====
// ============================================

interface SubBlocksPageProps {
  block: Block;
  onBack?: () => void;
}

export function SubBlocksPage({ block, onBack }: SubBlocksPageProps) {
  const { isDark } = useTheme();
  const [subBlocks, setSubBlocks] = useState<SubBlock[]>([]);
  const [filteredSubBlocks, setFilteredSubBlocks] = useState<SubBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubBlockStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<any>({});
  const [showAssayForm, setShowAssayForm] = useState(false);
  const [showDestinationForm, setShowDestinationForm] = useState(false);
  const [selectedSubBlock, setSelectedSubBlock] = useState<SubBlock | null>(null);

  const loadData = () => {
    const data = getSubBlocks(block.id);
    setSubBlocks(data);
    setFilteredSubBlocks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [block.id]);

  useEffect(() => {
    let filtered = [...subBlocks];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(sb => sb.code.toLowerCase().includes(q) || SubBlockStatusLabels[sb.status].includes(q));
    }
    if (statusFilter !== 'ALL') filtered = filtered.filter(sb => sb.status === statusFilter);
    if (dateFilter.startDate || dateFilter.endDate) {
      const start = dateFilter.startDate ? new Date(dateFilter.startDate).getTime() : 0;
      const end = dateFilter.endDate ? new Date(dateFilter.endDate).getTime() : Infinity;
      filtered = filtered.filter(sb => new Date(sb.createdAt).getTime() >= start && new Date(sb.createdAt).getTime() <= end);
    }
    setFilteredSubBlocks(filtered);
  }, [searchQuery, statusFilter, dateFilter, subBlocks]);

  const total = subBlocks.length;
  const completed = subBlocks.filter(sb => sb.status === 'COMPLETED' || sb.status === 'DESTINATION_ASSIGNED').length;
  const inProgress = subBlocks.filter(sb => sb.status !== 'COMPLETED' && sb.status !== 'CREATED').length;
  const needAction = subBlocks.filter(sb => sb.status === 'CREATED').length;

  const handleAssayResults = (results: any[]) => {
    results.forEach((result) => {
      const subBlock = getSubBlockById(result.subBlockId);
      if (!subBlock) return;
      let materialClass = '', destination = '';
      if (result.isWaste) {
        materialClass = result.wasteType === 'سنگی' ? 'WASTE_ROCK' : 'WASTE_ALLUVIAL';
        destination = result.wasteType === 'سنگی' ? 'WASTE_DUMP_ROCK' : 'WASTE_DUMP_ALLUVIAL';
      } else {
        if (result.assay >= 25) { materialClass = 'HIGH_GRADE'; destination = 'HIGH_GRADE_STOCKPILE'; }
        else if (result.assay >= 15) { materialClass = 'MEDIUM_GRADE'; destination = 'MEDIUM_GRADE_STOCKPILE'; }
        else { materialClass = 'LOW_GRADE'; destination = 'LOW_GRADE_STOCKPILE'; }
      }
      updateSubBlock(result.subBlockId, { assay: result.assay, materialClass, destination, status: 'LAB_COMPLETED' });
    });
    setShowAssayForm(false);
    loadData();
  };

  const getStatusBadge = (status: SubBlockStatus) => {
    const styles = {
      'CREATED': 'bg-[#AACCDD]/10 text-[#AACCDD] border-[#AACCDD]/20',
      'SAMPLED': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'LAB_COMPLETED': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'CLASSIFIED': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'DESTINATION_ASSIGNED': 'bg-green-500/10 text-green-400 border-green-500/20',
      'COMPLETED': 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return styles[status] || styles['CREATED'];
  };

  const bgPrimary = isDark ? 'bg-[#0A1628]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-[#8A9DB0]' : 'text-gray-500';
  const textMuted = isDark ? 'text-[#4A6A8A]' : 'text-gray-400';

  if (loading) return <div className={`flex items-center justify-center h-64 ${textSecondary}`}>در حال بارگذاری...</div>;

  return (
    <div className={`${bgPrimary} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* ===== هدر ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className={`p-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>مدیریت SubBlock‌ها</h2>
              <p className={`font-mono text-lg mt-0.5 ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>{block.code}</p>
              <p className={`text-sm ${textSecondary}`}>تراز: {block.targetLevel} | شماره: {block.blockNumber} | تعداد: {total}</p>
            </div>
          </div>
          <button onClick={loadData} className={`p-2 rounded-xl transition-colors ${
            isDark 
              ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}>
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ===== کارت‌های آماری ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="کل SubBlock" value={total} icon={CubeIcon} color={isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'} />
          <StatsCard title="تکمیل شده" value={`${completed}/${total}`} icon={CheckCircleIcon} color="text-green-400" subtitle={`${total > 0 ? Math.round((completed/total)*100) : 0}%`} />
          <StatsCard title="در حال انجام" value={inProgress} icon={ClockIcon} color="text-yellow-400" />
          <StatsCard title="نیاز به اقدام" value={needAction} icon={ExclamationTriangleIcon} color="text-red-400" />
        </div>

        {/* ===== فیلترها ===== */}
        <div className={`flex flex-wrap gap-3 items-center backdrop-blur-xl border rounded-xl p-3 ${
          isDark 
            ? 'bg-[#13203A]/40 border-[#AACCDD]/10' 
            : 'bg-white/60 border-gray-200'
        }`}>
          <div className="relative flex-1 min-w-[180px]">
            <MagnifyingGlassIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی SubBlock..."
              className={`w-full pr-10 pl-4 py-2 rounded-xl transition-all text-sm ${
                isDark 
                  ? 'bg-white/5 border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30' 
                  : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
              } border focus:outline-none`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SubBlockStatus | 'ALL')}
            className={`px-4 py-2 rounded-xl transition-all text-sm ${
              isDark 
                ? 'bg-white/5 border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30' 
                : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
            } border focus:outline-none`}
          >
            <option value="ALL">همه وضعیت‌ها</option>
            {Object.entries(SubBlockStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <DateRangePicker value={dateFilter} onChange={setDateFilter} onClear={() => setDateFilter({})} />
          {(searchQuery || statusFilter !== 'ALL' || dateFilter.startDate) && (
            <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setDateFilter({}); }} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors text-sm">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ===== دکمه‌های عملیاتی ===== */}
        <div className="flex flex-wrap gap-3">
          {subBlocks.some(sb => sb.status === 'CREATED' || sb.status === 'SAMPLED') && (
            <button onClick={() => setShowAssayForm(true)} className={`px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 border ${
              isDark 
                ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD] border-[#AACCDD]/20' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300'
            }`}>
              <BeakerIcon className="w-5 h-5" /> ثبت آنالیز گروهی
            </button>
          )}
          {subBlocks.some(sb => sb.status === 'LAB_COMPLETED' || sb.status === 'CLASSIFIED') && (
            <button onClick={() => setShowDestinationForm(true)} className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors flex items-center gap-2 border border-green-500/20">
              <MapPinIcon className="w-5 h-5" /> تعیین مقصد گروهی
            </button>
          )}
        </div>

        {/* ===== جدول ===== */}
        {filteredSubBlocks.length === 0 ? (
          <div className={`text-center py-16 backdrop-blur-xl border rounded-xl ${
            isDark 
              ? 'bg-[#13203A]/40 border-[#AACCDD]/10' 
              : 'bg-white/60 border-gray-200'
          }`}>
            <p className={`text-lg ${textSecondary}`}>هیچ SubBlockی یافت نشد</p>
            <p className={`text-sm mt-1 ${textMuted}`}>برای شروع، یک SubBlock جدید ایجاد کنید</p>
          </div>
        ) : (
          <div className={`overflow-hidden backdrop-blur-xl border rounded-xl ${
            isDark 
              ? 'bg-[#13203A]/40 border-[#AACCDD]/10' 
              : 'bg-white/60 border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
                    <th className={`px-4 py-3 text-xs font-medium ${textSecondary}`}>ردیف</th>
                    <th className={`px-4 py-3 text-xs font-medium ${textSecondary}`}>کد</th>
                    <th className={`px-4 py-3 text-xs font-medium ${textSecondary}`}>وضعیت</th>
                    <th className={`px-4 py-3 text-xs font-medium ${textSecondary}`}>عیار (%)</th>
                    <th className={`px-4 py-3 text-xs font-medium ${textSecondary}`}>مقصد</th>
                    <th className={`px-4 py-3 text-xs font-medium ${textSecondary}`}>تاریخ ثبت</th>
                    <th className={`px-4 py-3 text-xs font-medium ${textSecondary}`}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubBlocks.map((sb, index) => {
                    const badge = getStatusBadge(sb.status);
                    const isAssigned = sb.status === 'DESTINATION_ASSIGNED' || sb.status === 'COMPLETED';
                    return (
                      <tr key={sb.id} className={`border-b ${isDark ? 'border-[#AACCDD]/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <td className={`px-4 py-3 text-xs font-mono ${textMuted}`}>{index + 1}</td>
                        <td className={`px-4 py-3 font-medium ${textPrimary}`}>{sb.code}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge}`}>
                            {SubBlockStatusLabels[sb.status] || sb.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-mono ${textPrimary}`}>
                          {sb.assay !== undefined && sb.assay !== null ? (
                            <span className={isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}>{sb.assay.toFixed(1)}</span>
                          ) : <span className={textMuted}>—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isAssigned ? <span className={isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}>{DESTINATION_LABELS[sb.destination!] || sb.destination}</span> : <span className={textMuted}>—</span>}
                        </td>
                        <td className={`px-4 py-3 text-xs ${textMuted}`}>{new Date(sb.createdAt).toLocaleDateString('fa-IR')}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <AuditLogButton entityId={sb.id} />
                            <button className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-white/5 text-[#4A6A8A] hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'
                            }`}>
                              <DocumentPlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
              <span className={`text-sm ${textMuted}`}>نمایش {filteredSubBlocks.length} از {subBlocks.length} SubBlock</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== مودال‌ها ===== */}
      {showAssayForm && (
        <AssayFormModal
          subBlocks={subBlocks}
          onClose={() => setShowAssayForm(false)}
          onSuccess={handleAssayResults}
        />
      )}

      {showDestinationForm && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
          isDark ? 'bg-black/70' : 'bg-gray-900/50'
        }`}>
          <div className={`border rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            isDark 
              ? 'bg-[#0A1628] border-[#AACCDD]/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>تعیین مقصد</h3>
              <button onClick={() => setShowDestinationForm(false)} className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>مقصد</label>
                <select className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30'
                    : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
                }`}>
                  {Object.entries(DESTINATION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <button className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${
                isDark
                  ? 'bg-[#AACCDD] text-[#1A2A3A] hover:bg-[#8A9DB0]'
                  : 'bg-[#1A2A3A] text-white hover:bg-[#2A3A4A]'
              }`}>
                ثبت مقصد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}