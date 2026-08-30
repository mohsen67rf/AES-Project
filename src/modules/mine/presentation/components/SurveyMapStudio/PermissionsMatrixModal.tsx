// src/modules/mine/presentation/components/SurveyMapStudio/PermissionsMatrixModal.tsx

import React from 'react';
import type { StakeholderRole } from '../../../../../core/domain/types/mine.types';
import { SurveyPermissionService } from '../../../services/SurveyPermissionService';
import { 
  XMarkIcon, 
  ShieldCheckIcon, 
  CheckIcon, 
  XCircleIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface PermissionsMatrixModalProps {
  activeRole: StakeholderRole;
  onSelectRole: (role: StakeholderRole) => void;
  onClose: () => void;
}

export function PermissionsMatrixModal({
  activeRole,
  onSelectRole,
  onClose
}: PermissionsMatrixModalProps) {
  const permissionsList = SurveyPermissionService.getAllPermissions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 text-right shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        {/* هدر */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ShieldCheckIcon className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-white">ماتریس سطوح دسترسی به نقشه‌ها و ابزارهای مهندسی معدن (RBAC)</h3>
              <p className="text-xs text-slate-400">شفاف‌سازی دسترسی ارکان پروژه: کارفرما، نظارت، پیمانکار استخراج و پیمانکار خردایش</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* جعبه انتخاب نقش فعال برای تست زنده سامانه */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-cyan-400" />
            <span>
              <b>نقش فعال در این نشست:</b> <span className="font-bold text-cyan-300">{SurveyPermissionService.getPermissions(activeRole).title}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">تغییر نقش شبیه‌سازی:</span>
            {(['SUPERVISION', 'MINING_CONTRACTOR', 'CLIENT', 'CRUSHING_CONTRACTOR'] as StakeholderRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onSelectRole(r)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  activeRole === r
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r === 'SUPERVISION' ? 'نظارت / نقشه‌برداری' :
                 r === 'MINING_CONTRACTOR' ? 'پیمانکار استخراج' :
                 r === 'CLIENT' ? 'کارفرما' : 'پیمانکار خردایش'}
              </button>
            ))}
          </div>
        </div>

        {/* جدول تفصیلی ماتریس دسترسی‌ها */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">عملیات و ابزار روی نقشه</th>
                <th className="p-3.5 text-center text-cyan-400">واحد نظارت و نقشه‌برداری</th>
                <th className="p-3.5 text-center text-emerald-400">پیمانکار استخراج (دفتر فنی)</th>
                <th className="p-3.5 text-center text-amber-400">واحد کارفرما (مدیریت)</th>
                <th className="p-3.5 text-center text-purple-400">پیمانکار خردایش و دیسپاچینگ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <span>📥 بارگذاری نقشه جدید (DXF, GeoJSON, پهپاد)</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-rose-500" /></td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-white">
                  <span>🔷 ترسیم و تفکیک هندسی ساب‌بلوک‌ها (SA..SD)</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-slate-600" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-rose-500" /></td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-white">
                  <span>💥 طراحی الگوی چال‌پاشی و مرز آتشباری</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-slate-600" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-rose-500" /></td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-white">
                  <span>✏️ ویرایش عیار، تناژ و مشخصات المان‌ها</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-slate-600" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-rose-500" /></td>
              </tr>

              <tr className="hover:bg-slate-800/40 bg-amber-950/20">
                <td className="p-3.5 font-bold text-amber-300">
                  <span>📜 تصویب و ابلاغ نسخه رسمی نقشه (Publish)</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-rose-500" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-rose-500" /></td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-white">
                  <span>📌 ثبت یادداشت مهندسی و ابلاغیه روی نقشه</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><XCircleIcon className="w-5 h-5 mx-auto text-rose-500" /></td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-white">
                  <span>📐 خط‌کش اندازه‌گیری مسافت تا سنگ‌شکن و دپوها</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="p-3.5 font-bold text-white">
                  <span>👁️ مشاهده آنلاین تغییرات و لایه‌ها</span>
                </td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
                <td className="p-3.5 text-center"><CheckIcon className="w-5 h-5 mx-auto text-emerald-400" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* توضیحات کاربردی */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
          <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4" />
            <span>نحوه گردش کار برخط در سامانه:</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed pr-1">
            <li><b>واحد نقشه‌برداری نظارت</b> نقشه پایه توپوگرافی و منحنی میزان پیت را وارد سامانه می‌کند.</li>
            <li><b>دفتر فنی پیمانکار استخراج</b> بر اساس عیار پودر چال، ساب‌بلوک‌های SA تا SD را با ابزار چندضلعی روی نقشه ترسیم و ذخیره می‌کند.</li>
            <li><b>کارفرما یا سرپرست نظارت</b> پس از بررسی هندسی، نسخه رسمی نقشه را تصویب (Approve) و ابلاغ می‌نمایند.</li>
            <li><b>پیمانکار خردایش و رانندگان</b> نقشه تصویب شده و مقاصد بارگیری هر ساب‌بلوک را در تبلت یا مانیتورینگ خود به صورت برخط مشاهده می‌کنند.</li>
          </ol>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20"
          >
            متوجه شدم و بستن
          </button>
        </div>
      </div>
    </div>
  );
}
