// src/modules/mine/presentation/pages/BlocksPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CubeIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  DocumentPlusIcon, 
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../shared/context/ThemeContext';
import { AddSubBlockForm } from '../components/AddSubBlockForm';
import { AssayForm } from '../components/AssayForm';

// ============================================
// نوع‌های داده
// ============================================

interface Block {
  id: string;
  code: string;
  name: string;
  targetLevel: number;
  blockNumber: number;
  status: string;
  drillingParams?: {
    totalHoles: number;
    holeDiameter: number;
    avgDesignDepth: number;
    pattern: string;
  };
  createdAt: string;
}

interface SubBlock {
  id: string;
  blockId: string;
  code: string;
  sequence: number;
  status: string;
  assay?: number;
  materialClass?: string;
  destination?: string;
  createdBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// سرویس‌های دیتابیس
// ============================================

const BLOCKS_KEY = 'aes_blocks';
const SUBBLOCKS_KEY = 'aes_subblocks';

function getBlocks(): Block[] {
  try {
    const data = localStorage.getItem(BLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getSubBlocks(blockId?: string): SubBlock[] {
  try {
    const data = localStorage.getItem(SUBBLOCKS_KEY);
    const subBlocks: SubBlock[] = data ? JSON.parse(data) : [];
    return blockId ? subBlocks.filter(sb => sb.blockId === blockId) : subBlocks;
  } catch {
    return [];
  }
}

function saveSubBlocks(subBlocks: SubBlock[]): void {
  localStorage.setItem(SUBBLOCKS_KEY, JSON.stringify(subBlocks));
}

function saveBlocks(blocks: Block[]): void {
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
}

// ============================================
// کامپوننت اصلی
// ============================================

export function BlocksPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSubBlockForm, setShowSubBlockForm] = useState(false);
  const [showAssayForm, setShowAssayForm] = useState(false);
  const [selectedBlockForSubBlock, setSelectedBlockForSubBlock] = useState<Block | null>(null);
  const [pendingSubBlocks, setPendingSubBlocks] = useState<{ id: string; code: string }[]>([]);

  const loadData = () => {
    const data = getBlocks();
    setBlocks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===== رفتن به صفحه‌ی جزئیات بلوک =====
  const handleSelectBlock = (blockId: string) => {
    navigate(`/block/${blockId}`);
  };

  // ===== ایجاد SubBlock و نمایش فرم آنالیز =====
  const handleAddSubBlocks = (blockId: string, count: number) => {
    const current = getSubBlocks(blockId);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const pending: { id: string; code: string }[] = [];

    for (let i = 0; i < count; i++) {
      const code = `SB-${letters[i]}`;
      const newSubBlock: SubBlock = {
        id: crypto.randomUUID(),
        blockId: blockId,
        code: code,
        sequence: current.length + i + 1,
        status: 'CREATED',
        createdBy: '1',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      current.push(newSubBlock);
      pending.push({ id: newSubBlock.id, code: newSubBlock.code });
    }

    saveSubBlocks(current);
    setPendingSubBlocks(pending);
    setShowSubBlockForm(false);
    setSelectedBlockForSubBlock(null);
    setShowAssayForm(true);
  };

  // ===== ثبت نتایج آنالیز =====
  const handleAssayResults = (results: any[]) => {
    const subBlocks = getSubBlocks();
    
    results.forEach((result) => {
      const index = subBlocks.findIndex(sb => sb.id === result.subBlockId);
      if (index === -1) return;

      let materialClass = '', destination = '';
      if (result.isWaste) {
        materialClass = result.wasteType === 'سنگی' ? 'WASTE_ROCK' : 'WASTE_ALLUVIAL';
        destination = result.wasteType === 'سنگی' ? 'WASTE_DUMP_ROCK' : 'WASTE_DUMP_ALLUVIAL';
      } else {
        if (result.assay >= 25) { materialClass = 'HIGH_GRADE'; destination = 'HIGH_GRADE_STOCKPILE'; }
        else if (result.assay >= 15) { materialClass = 'MEDIUM_GRADE'; destination = 'MEDIUM_GRADE_STOCKPILE'; }
        else { materialClass = 'LOW_GRADE'; destination = 'LOW_GRADE_STOCKPILE'; }
      }

      subBlocks[index] = {
        ...subBlocks[index],
        assay: result.assay,
        materialClass,
        destination,
        status: 'LAB_COMPLETED',
        version: subBlocks[index].version + 1,
        updatedAt: new Date().toISOString(),
      };
    });

    saveSubBlocks(subBlocks);
    setShowAssayForm(false);
    setPendingSubBlocks([]);
    loadData();
  };

  // ===== فیلتر بلوک‌ها =====
  const filteredBlocks = blocks.filter(b =>
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(b.targetLevel).includes(searchQuery)
  );

  const bgPrimary = isDark ? 'bg-[#0A1628]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-[#8A9DB0]' : 'text-gray-500';
  const borderColor = isDark ? 'border-[#AACCDD]/10' : 'border-gray-200';

  if (loading) {
    return <div className={`flex items-center justify-center h-64 ${textSecondary}`}>در حال بارگذاری...</div>;
  }

  return (
    <div className={`${bgPrimary} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* ===== هدر ===== */}
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>مدیریت بلوک‌ها</h2>
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => setShowAddForm(true)}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                isDark 
                  ? 'bg-[#AACCDD] text-[#1A2A3A] hover:bg-[#8A9DB0]' 
                  : 'bg-[#1A2A3A] text-white hover:bg-[#2A3A4A]'
              }`}
            >
              <DocumentPlusIcon className="w-5 h-5" />
              افزودن بلوک جدید
            </button>
          </div>
        </div>

        {/* ===== جستجو ===== */}
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی بلوک..."
            className={`w-full pr-12 pl-4 py-3 rounded-xl border transition-all ${
              isDark 
                ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#AACCDD]/30' 
                : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#1A2A3A]/30'
            } focus:outline-none`}
          />
        </div>

        {/* ===== لیست بلوک‌ها ===== */}
        {filteredBlocks.length === 0 ? (
          <div className={`text-center py-16 rounded-xl border ${borderColor} ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
            <p className={textSecondary}>هیچ بلوکی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlocks.map((block) => {
              const subBlockCount = getSubBlocks(block.id).length;
              
              return (
                <div
                  key={block.id}
                  onClick={() => handleSelectBlock(block.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                    isDark 
                      ? 'bg-[#13203A]/40 border-[#AACCDD]/10 hover:border-[#AACCDD]/30 hover:bg-[#AACCDD]/5' 
                      : 'bg-white/60 border-gray-200 hover:border-[#1A2A3A]/30 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold font-mono text-lg ${textPrimary}`}>{block.code}</span>
                    <CubeIcon className={`w-5 h-5 ${isDark ? 'text-[#8A9DB0] group-hover:text-[#AACCDD]' : 'text-gray-400 group-hover:text-gray-700'} transition-colors`} />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`text-xs ${textSecondary}`}>
                      تراز: <span className={isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}>{block.targetLevel}</span> | 
                      شماره: <span className={isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}>{block.blockNumber}</span>
                    </span>
                    <span className={`text-xs font-medium ${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'}`}>
                      {subBlockCount} SubBlock
                    </span>
                  </div>
                  {block.drillingParams && (
                    <div className={`mt-2 text-xs ${textSecondary}`}>
                      چال‌ها: {block.drillingParams.totalHoles} | 
                      عمق: {block.drillingParams.avgDesignDepth}m
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      block.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                      block.status === 'DRILLING' ? 'bg-yellow-500/20 text-yellow-400' :
                      block.status === 'DRILLED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {block.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBlockForSubBlock(block);
                        setShowSubBlockForm(true);
                      }}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 border ${
                        isDark 
                          ? 'bg-[#AACCDD]/10 text-[#AACCDD] border-[#AACCDD]/20 hover:bg-[#AACCDD]/20' 
                          : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                      }`}
                    >
                      <PlusIcon className="w-3 h-3" />
                      افزودن SubBlock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== مودال افزودن بلوک ===== */}
        {showAddForm && (
          <AddSubBlockForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              loadData();
            }}
          />
        )}

        {/* ===== مودال افزودن SubBlock ===== */}
        {showSubBlockForm && selectedBlockForSubBlock && (
          <AddSubBlockForm
            onClose={() => {
              setShowSubBlockForm(false);
              setSelectedBlockForSubBlock(null);
            }}
            onSuccess={handleAddSubBlocks}
          />
        )}

        {/* ===== مودال ثبت آنالیز ===== */}
        {showAssayForm && (
          <AssayForm
            subBlocks={pendingSubBlocks.map(sb => ({ 
              id: sb.id, 
              code: sb.code, 
              assay: undefined, 
              isWaste: false 
            }))}
            onClose={() => {
              setShowAssayForm(false);
              setPendingSubBlocks([]);
            }}
            onSuccess={handleAssayResults}
          />
        )}
      </div>
    </div>
  );
}