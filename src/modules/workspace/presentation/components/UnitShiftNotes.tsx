// src/modules/workspace/presentation/components/UnitShiftNotes.tsx

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { UnitShiftNote } from '../../domain/workspace.types';
import { INITIAL_SHIFT_NOTES } from '../../domain/roleWorkspaceData';
import { 
  FileText, 
  Plus, 
  Clock, 
  AlertCircle, 
  Check, 
  Send,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { ShiftHandoverModal } from './ShiftHandover/ShiftHandoverModal';

interface UnitShiftNotesProps {
  roleId: string;
  authorName: string;
  authorCode: string;
}

export const UnitShiftNotes: React.FC<UnitShiftNotesProps> = ({ roleId, authorName, authorCode }) => {
  const { isDark, theme } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const storageKey = 'aes_unit_shift_notes';
  const [notes, setNotes] = useState<UnitShiftNote[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_SHIFT_NOTES as UnitShiftNote[];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'OPERATIONAL' | 'SAFETY' | 'EQUIPMENT' | 'HANDOVER'>('OPERATIONAL');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');

  // Filter notes relevant to this role or general
  const filteredNotes = notes.filter(n => n.roleId.toLowerCase() === roleId.toLowerCase() || n.roleId === 'ALL');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: UnitShiftNote = {
      id: `note-${Date.now()}`,
      roleId,
      authorName,
      authorCode,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      priority: newPriority,
      timestamp: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">فوری</span>;
      case 'IMPORTANT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">مهم</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">عادی</span>;
    }
  };

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
          <div className="w-8 h-8 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center font-black border border-[#00D2FF]/20">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black flex items-center gap-2 text-[#F1F5F9]">
            <span>یادداشت‌ها و لاگ شیفت</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHandoverModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#00D2FF] bg-[#00D2FF]/10 hover:bg-[#00D2FF]/20 border border-[#00D2FF]/30 transition-all cursor-pointer"
            title="پروتکل تحویل و تحول هوشمند شیفت (Shift Handover)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تحویل شیفت</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] hover:brightness-110 shadow-[0_0_12px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'انصراف' : 'ثبت یادداشت'}</span>
          </button>
        </div>
      </div>

      {/* Add Note Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddNote} className="mt-4 p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">موضوع یادداشت</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="مثلا: تغییر زاویه پله ۱۰۴۰ یا افت فشار فیدر"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">دسته‌بندی</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="OPERATIONAL">عملیاتی</option>
                  <option value="SAFETY">ایمنی / HSE</option>
                  <option value="EQUIPMENT">ماشین‌آلات</option>
                  <option value="HANDOVER">تحویل شیفت</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">اولویت</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="NORMAL">عادی</option>
                  <option value="IMPORTANT">مهم</option>
                  <option value="URGENT">فوری</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">متن مشروح یادداشت / وقایع</label>
            <textarea
              rows={3}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="توضیحات فنی، اقدامات انجام‌شده، نیازمندی شیفت بعد..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Send className="w-3 h-3" />
              <span>ثبت رسمی در کارتابل شیفت</span>
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="mt-4 space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            یادداشت فعالی برای این واحد ثبت نشده است. از دکمه بالا برای ثبت گزارش شیفت استفاده نمایید.
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-900/40 border-slate-800' 
                  : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white">{note.title}</h4>
                  {getPriorityBadge(note.priority)}
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {new Date(note.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-indigo-400" />
                  <span>ثبت‌کننده: <strong className="text-slate-200">{note.authorName}</strong> ({note.authorCode})</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold">
                  {note.category === 'OPERATIONAL' ? 'عملیاتی' : note.category === 'SAFETY' ? 'ایمنی' : note.category === 'EQUIPMENT' ? 'ماشین‌آلات' : 'تحویل شیفت'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <ShiftHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        currentUser={{
          id: `usr-${roleId}`,
          fullName: authorName,
          code: authorCode,
          role: roleId as any,
          department: roleId,
          email: '',
          isActive: true
        }}
        targetDepartmentKey={roleId}
      />
    </div>
  );
};
