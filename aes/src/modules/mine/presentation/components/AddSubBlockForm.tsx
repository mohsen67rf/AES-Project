// src/modules/mine/presentation/components/AddSubBlockForm.tsx

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ============================================
// نوع‌های داده
// ============================================

interface Block {
  id: string;
  code: string;
  name: string;
  targetLevel: number;
  blockNumber: number;
}

// ============================================
// سرویس‌های دیتابیس (داخل خود فایل)
// ============================================

const BLOCKS_KEY = 'aes_blocks';

function getBlocks(): Block[] {
  try {
    const data = localStorage.getItem(BLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function addBlock(block: Omit<Block, 'id'>): Block {
  const blocks = getBlocks();
  const newBlock: Block = {
    id: crypto.randomUUID(),
    ...block,
  };
  blocks.push(newBlock);
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  return newBlock;
}

// ============================================
// کامپوننت اصلی
// ============================================

interface AddSubBlockFormProps {
  onClose: () => void;
  onSuccess: (blockId: string, count: number) => void;
}

export function AddSubBlockForm({ onClose, onSuccess }: AddSubBlockFormProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [subBlockCount, setSubBlockCount] = useState(3);
  
  const [targetLevel, setTargetLevel] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [showNewBlock, setShowNewBlock] = useState(false);

  useEffect(() => {
    setBlocks(getBlocks());
  }, []);

  // ===== ساخت کد بلوک با فرمت: تراز + space + B + space + شماره =====
  const generateBlockCode = (level: string, number: string) => {
    if (!level || !number) return '';
    return `${level} B ${number}`;
  };

  const handleAddBlock = () => {
    if (!targetLevel.trim() || !blockNumber.trim()) {
      alert('لطفاً تراز هدف و شماره بلوک را وارد کنید');
      return;
    }

    const level = parseInt(targetLevel);
    const number = parseInt(blockNumber);
    
    if (isNaN(level) || isNaN(number)) {
      alert('تراز هدف و شماره بلوک باید عدد باشند');
      return;
    }

    const code = generateBlockCode(targetLevel, blockNumber);
    
    const newBlock = addBlock({
      code: code,
      name: code,
      targetLevel: level,
      blockNumber: number,
    });
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setTargetLevel('');
    setBlockNumber('');
    setShowNewBlock(false);
  };

  const handleSubmit = () => {
    if (!selectedBlockId) {
      alert('لطفاً یک بلوک انتخاب کنید');
      return;
    }
    if (subBlockCount < 1 || subBlockCount > 10) {
      alert('تعداد ساب‌بلوک‌ها باید بین ۱ تا ۱۰ باشد');
      return;
    }
    onSuccess(selectedBlockId, subBlockCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#13203A] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">افزودن SubBlock جدید</h4>
          <button
            onClick={onClose}
            className="text-[#8A9DB0] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">بلوک *</label>
            <select
              value={selectedBlockId}
              onChange={(e) => setSelectedBlockId(e.target.value)}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
            >
              <option value="">انتخاب بلوک...</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => setShowNewBlock(!showNewBlock)}
              className="text-sm text-[#AACCDD] hover:text-white transition-colors"
            >
              {showNewBlock ? '− لغو' : '+ افزودن بلوک جدید'}
            </button>
            
            {showNewBlock && (
              <div className="mt-3 space-y-3 p-4 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8A9DB0] text-xs mb-1">تراز هدف *</label>
                    <input
                      type="number"
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(e.target.value)}
                      placeholder="مثال: 1040"
                      className="w-full px-3 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#8A9DB0] text-xs mb-1">شماره بلوک *</label>
                    <input
                      type="number"
                      value={blockNumber}
                      onChange={(e) => setBlockNumber(e.target.value)}
                      placeholder="مثال: 60"
                      className="w-full px-3 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
                    />
                  </div>
                </div>

                <div className="bg-[#13203A]/40 p-2 rounded-lg text-center">
                  <p className="text-[#8A9DB0] text-xs">
                    کد بلوک: <span className="text-[#AACCDD] font-mono font-bold text-sm">
                      {generateBlockCode(targetLevel, blockNumber) || '___ B ___'}
                    </span>
                  </p>
                  <p className="text-[#4A6A8A] text-[10px] mt-0.5">
                    فرمت: [تراز هدف] + [space] + B + [space] + [شماره بلوک]
                  </p>
                </div>

                <button
                  onClick={handleAddBlock}
                  className="w-full py-2 bg-[#AACCDD] text-[#1A2A3A] rounded-lg hover:bg-[#8A9DB0] transition-colors text-sm"
                >
                  افزودن بلوک
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">تعداد SubBlock‌ها *</label>
            <input
              type="number"
              value={subBlockCount}
              onChange={(e) => setSubBlockCount(parseInt(e.target.value) || 1)}
              min={1}
              max={10}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-xl text-white focus:outline-none focus:border-[#AACCDD]/30"
            />
            <p className="text-[#4A6A8A] text-xs mt-1">حداکثر ۱۰ ساب‌بلوک</p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-xl hover:bg-[#8A9DB0] transition-colors"
          >
            ایجاد SubBlock‌ها
          </button>
        </div>
      </div>
    </div>
  );
}