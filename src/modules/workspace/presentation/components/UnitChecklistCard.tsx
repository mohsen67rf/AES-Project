// src/modules/workspace/presentation/components/UnitChecklistCard.tsx

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { CheckCircle2, Circle, ListChecks, RotateCcw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  labelFa: string;
  isDone: boolean;
  requiredRole: string;
}

interface UnitChecklistCardProps {
  roleId: string;
  initialItems: ChecklistItem[];
}

export const UnitChecklistCard: React.FC<UnitChecklistCardProps> = ({ roleId, initialItems }) => {
  const { isDark, theme } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const storageKey = `aes_unit_checklist_${roleId}`;
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return initialItems;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems(initialItems);
      }
    } catch {
      setItems(initialItems);
    }
  }, [roleId]);

  const toggleItem = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, isDone: !item.isDone } : item);
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleReset = () => {
    setItems(initialItems);
    localStorage.setItem(storageKey, JSON.stringify(initialItems));
  };

  const doneCount = items.filter(i => i.isDone).length;
  const progressPercent = Math.round((doneCount / (items.length || 1)) * 100);

  return (
    <div 
      className={`rounded-[22px] border p-5 transition-all shadow-[0_12px_32px_rgba(7,11,26,0.5)] ${
        isDark
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9]'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#24356B]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black border border-emerald-500/20">
            <ListChecks className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black flex items-center gap-2 text-[#F1F5F9]">
            <span>چک‌لیست الزامات شیفت</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-400">
            {doneCount}/{items.length} ({progressPercent}٪)
          </span>
          <button
            onClick={handleReset}
            title="بازنشانی چک‌لیست"
            className="p-1 rounded-lg hover:bg-[#141F42] text-[#8E9EB8] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-[#141F42] rounded-full h-1.5 overflow-hidden my-3 border border-[#24356B]/20">
        <div 
          className="h-full bg-gradient-to-r from-[#00D2FF] to-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Items List */}
      <div className="space-y-2 pt-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
              item.isDone
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through opacity-75'
                : isDark
                ? 'bg-[#141F42] border-[#24356B]/30 hover:border-[#00D2FF]/40 text-[#F1F5F9]'
                : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-[#8E9EB8] flex-shrink-0" />
              )}
              <span className="text-xs font-medium">{item.labelFa}</span>
            </div>
            <span className="text-[10px] text-[#8E9EB8] font-mono flex-shrink-0">اجباری</span>
          </div>
        ))}
      </div>
    </div>
  );
};
