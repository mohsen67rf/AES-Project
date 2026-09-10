// src/modules/workspace/presentation/components/RoleDeskHeader.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { SYSTEM_ROLES, getRoleDefinition } from '../../../auth/domain/roles';
import { UnitSpecializedData } from '../../domain/workspace.types';
import type { User } from '../../../../core/domain/types/mine.types';
import { 
  Building2, 
  ChevronDown, 
  UserCheck, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ArrowRightLeft,
  Plus
} from 'lucide-react';

interface RoleDeskHeaderProps {
  currentUser: User | null;
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  unitData: UnitSpecializedData;
  onOpenAssignModal: () => void;
  onOpenQuickLogModal: () => void;
}

export const RoleDeskHeader: React.FC<RoleDeskHeaderProps> = ({
  currentUser,
  selectedRoleId,
  onSelectRole,
  unitData,
  onOpenAssignModal,
  onOpenQuickLogModal,
}) => {
  const { isDark, theme } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const activeRoleDef = getRoleDefinition(selectedRoleId);
  const isUserOwnRole = currentUser && currentUser.role.toLowerCase() === selectedRoleId.toLowerCase();

  return (
    <div 
      className={`rounded-2xl sm:rounded-[24px] border p-4 sm:p-6 transition-all duration-300 relative z-30 shadow-[0_12px_32px_rgba(7,11,26,0.45)] ${
        isDark
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9]'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Background Accent Glow (contained in its own overflow-hidden layer) */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-[24px] overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: '#00D2FF' }}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        {/* Left: Role identity and department */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div 
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-[18px] flex items-center justify-center font-bold border transition-all duration-300 shadow-md shrink-0 ${
              isDark
                ? 'bg-[#141F42] border-[#24356B]/60 text-[#00D2FF]'
                : activeRoleDef.badgeColor
            }`}
          >
            <activeRoleDef.icon className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isDark
                  ? 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/30'
                  : 'bg-indigo-50 text-indigo-600 border-indigo-200'
              }`}>
                {activeRoleDef.department}
              </span>

              {isUserOwnRole ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isRtl ? 'واحد شما' : 'Your Desk'}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30 flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>{isRtl ? 'مشاهده میهمان' : 'Inspect'}</span>
                </span>
              )}

              <span className="text-[11px] text-[#8E9EB8] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>شیفت ۱</span>
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-[#F1F5F9]">
                <span>{isRtl ? `میز کار ${activeRoleDef.nameFa}` : `${activeRoleDef.nameEn} Workspace`}</span>
              </h1>

              <span className="flex items-center gap-1.5 text-xs text-[#8E9EB8]">
                <MapPin className="w-3.5 h-3.5 text-[#FFB020]" />
                <span className="text-[#F1F5F9] font-medium">{unitData.activeWorksite}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher & Direct Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 9-Unit Desk Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                showRoleMenu
                  ? 'bg-[#00D2FF]/15 border-[#00D2FF] text-[#00D2FF]'
                  : isDark
                  ? 'bg-[#141F42] hover:bg-[#1E2D5C] border-[#24356B]/40 text-[#F1F5F9]'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
              title="تغییر میز کار بین ۹ واحد عملیاتی معدن"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00D2FF]" />
                <span>{isRtl ? 'تغییر واحد' : 'Switch Desk'}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#00D2FF]/20 text-[10px] text-[#00D2FF] font-mono">
                  {activeRoleDef.nameFa.split(' ')[0]}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showRoleMenu ? 'rotate-180' : ''}`} />
            </button>

            {showRoleMenu && (
              <>
                <div 
                  className="fixed inset-0 z-[80]" 
                  onClick={() => setShowRoleMenu(false)} 
                />
                <div 
                  className={`absolute ${isRtl ? 'right-0' : 'left-0'} mt-2 w-[calc(100vw-2.5rem)] sm:w-88 max-w-sm rounded-2xl border p-2.5 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl ${
                    isDark
                      ? 'bg-[#121B3B] border-[#24356B] text-[#F1F5F9] ring-1 ring-[#00D2FF]/20'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xl ring-1 ring-slate-300'
                  }`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <div className="px-3 py-2 border-b border-[#24356B]/30 text-xs font-bold text-[#8E9EB8] flex items-center justify-between">
                    <span className="text-[#F1F5F9] font-black">انتخاب میز کار واحد:</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] font-mono">۹ واحد عملیاتی</span>
                  </div>

                  <div className="space-y-1 mt-1.5 max-h-84 overflow-y-auto custom-scrollbar pr-0.5">
                    {SYSTEM_ROLES.map((r) => {
                      const isSelected = r.id.toLowerCase() === selectedRoleId.toLowerCase();
                      const IconComp = r.icon;
                      return (
                        <button
                          key={r.id}
                          onClick={() => {
                            onSelectRole(r.id);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'bg-[#00D2FF]/15 border border-[#00D2FF]/40 text-[#00D2FF] font-black'
                              : 'hover:bg-[#1A264F] text-[#8E9EB8] hover:text-[#F1F5F9]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs border shrink-0 ${r.badgeColor}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-bold truncate text-[12px]">{r.nameFa}</p>
                              <p className="text-[10px] text-[#8E9EB8] truncate">{r.department}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00D2FF] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Assign Task Button */}
          <button
            onClick={onOpenAssignModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] hover:brightness-110 shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isRtl ? 'ارجاع تسک' : 'Assign'}</span>
          </button>

          {/* Log Event / Handover Button */}
          <button
            onClick={onOpenQuickLogModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#24356B]/40 bg-[#141F42] hover:bg-[#1E2D5C] text-[#F1F5F9] transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#00D2FF]" />
            <span>{isRtl ? 'ثبت وقایع' : 'Log'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Objective Banner */}
      <div className={`mt-4 pt-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isDark ? 'border-[#24356B]/30' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#FFB020]">تارگت شیفت:</span>
          <span className="text-[#F1F5F9] font-medium">
            {unitData.currentObjectiveFa}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#8E9EB8]">انطباق:</span>
          <div className="w-28 bg-[#141F42] rounded-full h-2 overflow-hidden border border-[#24356B]/30">
            <div 
              className="bg-gradient-to-r from-[#00D2FF] to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${unitData.complianceRate}%` }}
            />
          </div>
          <span className="font-mono font-black text-emerald-400">{unitData.complianceRate}٪</span>
        </div>
      </div>
    </div>
  );
};
