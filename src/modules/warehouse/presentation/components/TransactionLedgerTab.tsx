// src/modules/warehouse/presentation/components/TransactionLedgerTab.tsx

import React, { useState } from 'react';
import { WarehouseTransaction } from '../../domain/types/warehouse.types';
import { 
  ClipboardDocumentListIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  TruckIcon, 
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface TransactionLedgerTabProps {
  transactions: WarehouseTransaction[];
  isDark: boolean;
  onViewProtocol: (tx: WarehouseTransaction) => void;
}

export const TransactionLedgerTab: React.FC<TransactionLedgerTabProps> = ({
  transactions,
  isDark,
  onViewProtocol
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.targetBlockCode && t.targetBlockCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.permitNumber && t.permitNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.contractorName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'INTAKE') return t.type === 'INTAKE';
    if (filterType === 'CONSUMPTION_BLOCK') return t.type === 'CONSUMPTION_BLOCK';
    if (filterType === 'DISPATCH_FLEET') return t.type === 'DISPATCH_FLEET';

    return true;
  });

  return (
    <div className={`p-5 rounded-2xl border space-y-4 ${
      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              دفتر کل گردش کالا و تراکنش‌های انبار (شارژ، خروج و مصرف بلوک‌ها)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ردگیری دقیق و ممیزی لحظه‌ای ورود و خروج هر کیلوگرم ماده ناریه و لیتر سوخت با شماره بارنامه و مجوز رسمی
            </p>
          </div>
        </div>

        {/* فیلتر نوع تراکنش */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            همه ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('INTAKE')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'INTAKE' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            شارژ انبار (ورود)
          </button>
          <button
            onClick={() => setFilterType('CONSUMPTION_BLOCK')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'CONSUMPTION_BLOCK' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            مصرف بلوک‌های معدنی
          </button>
          <button
            onClick={() => setFilterType('DISPATCH_FLEET')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'DISPATCH_FLEET' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            سوخت‌گیری ناوگان
          </button>
        </div>
      </div>

      {/* جستجو */}
      <div>
        <input
          type="text"
          placeholder="جستجو با شماره پیگیری، نام ماده، کد بلوک معدنی (مثلاً 1040 B 32)، شماره پروانه یا پیمانکار..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* جدول تراکنش‌ها */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <th className="py-3 px-3 font-semibold">کد رهگیری</th>
              <th className="py-3 px-3 font-semibold">نوع عملیات</th>
              <th className="py-3 px-3 font-semibold">شرح کالا</th>
              <th className="py-3 px-3 font-semibold">مقدار تراکنش</th>
              <th className="py-3 px-3 font-semibold">بلوک / مقصد</th>
              <th className="py-3 px-3 font-semibold">پیمانکار / تحویل‌گیرنده</th>
              <th className="py-3 px-3 font-semibold">مجوز / صورتجلسه</th>
              <th className="py-3 px-3 font-semibold">تاریخ و زمان</th>
              <th className="py-3 px-3 font-semibold">صورتجلسه</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTransactions.map((tx) => {
              const isIntake = tx.type === 'INTAKE';
              const isBlock = tx.type === 'CONSUMPTION_BLOCK';

              return (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                    {tx.trackingCode}
                  </td>
                  <td className="py-3 px-3">
                    {isIntake ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <ArrowDownTrayIcon className="w-3 h-3" /> شارژ انبار
                      </span>
                    ) : isBlock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                        <ArrowUpTrayIcon className="w-3 h-3" /> مصرف در بلوک
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                        <TruckIcon className="w-3 h-3" /> سوخت ناوگان
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {tx.itemName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-black ${isIntake ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {isIntake ? '+' : '-'}{tx.quantity.toLocaleString()} {tx.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                    {tx.targetBlockCode || tx.targetEquipmentId || 'انبار مرکزی'}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                    {tx.contractorName}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {tx.permitNumber || '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {new Date(tx.timestamp).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="py-3 px-3">
                    {isBlock && (
                      <button
                        onClick={() => onViewProtocol(tx)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <DocumentTextIcon className="w-3.5 h-3.5" />
                        مشاهده
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
